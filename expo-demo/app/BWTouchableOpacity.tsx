import React, { useState, useRef, useCallback } from "react";
import { StyleProp, ViewStyle, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

const MAX_MOVE_DISTANCE = 50;

interface BWTouchableOpacityProps {
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  onLongPress?: () => void;
  children: React.ReactNode;
  activeOpacity?: number;
  disabled?: boolean;
  delayLongPress?: number;
  collapsable?: boolean; // 高级用法，是否允许在 Android 下折叠子元素以提升性能，默认不允许，目前允许的场景只在 MessageItem 中使用（如果关闭会导致布局问题）
}

export const BWTouchableOpacity: React.FC<BWTouchableOpacityProps> = ({
  style,
  onPress,
  onLongPress,
  children,
  activeOpacity = 0.5,
  delayLongPress = 500,
  collapsable = false,
  disabled = false,
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const firstTouchRef = useRef<{
    x: number;
    y: number;
    timestamp: number;
  } | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetTouchState = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    firstTouchRef.current = null;
    setIsPressed(false);
  }, []);

  const tapGesture = Gesture.Tap()
    .runOnJS(true)
    .maxDistance(MAX_MOVE_DISTANCE)
    .onStart(() => {
      setIsPressed(true);
    })
    .onEnd(() => {
      //如果是长按点按都支持的，则需要清除长按的计时器
      resetTouchState();
      onPress?.();
    });

  const longPressGesture = Gesture.LongPress()
    .runOnJS(true)
    .minDuration(delayLongPress)
    .maxDistance(MAX_MOVE_DISTANCE)
    .onBegin((event) => {
      if (disabled) {
        return;
      }
      firstTouchRef.current = {
        x: event.x,
        y: event.y,
        timestamp: Date.now(),
      };
      // 在Begin后的100ms 开始进行 setIsPressed(true);
      timeoutRef.current = setTimeout(() => {
        setIsPressed(true);
      }, 100);
    })
    .onTouchesMove((event) => {
      const currentTouch = event.allTouches[0];
      if (!currentTouch || !firstTouchRef.current) return;
      const deltaX = currentTouch.x - firstTouchRef.current.x;
      const deltaY = currentTouch.y - firstTouchRef.current.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      // 在100ms内，发生了onTouchesMove事件，并且移动距离超过阈值，则取消这次更新
      if (timeoutRef.current && distance >= MAX_MOVE_DISTANCE) {
        resetTouchState(); // 确保状态关闭
      }
    })
    .onStart(() => {
      onLongPress?.();
    })
    .onTouchesCancelled(() => {
      resetTouchState();
    })
    .onEnd(() => {
      resetTouchState();
    });

  const composedGesture = onLongPress
    ? Gesture.Exclusive(longPressGesture, tapGesture)
    : tapGesture;

  if (disabled) {
    return <View style={style}>{children}</View>;
  }

  return (
    <GestureDetector gesture={composedGesture}>
      {collapsable ? (
        children
      ) : (
        <View
          collapsable={false}
          style={[style, { opacity: isPressed ? activeOpacity : 1 }]}
        >
          {children}
        </View>
      )}
    </GestureDetector>
  );
};
