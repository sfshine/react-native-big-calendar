import React, { useRef, useEffect } from "react";
import {
  FlatList,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ViewStyle,
  StyleProp,
  InteractionManager,
} from "react-native";

interface PagerViewProps<T> {
  data: readonly T[] | null | undefined;
  renderPage: (info: { item: T; index: number }) => React.ReactElement | null;
  onPageChanged: (index: number) => void;
  initialPageIndex: number;
  style?: StyleProp<ViewStyle>;
  keyExtractor?: (item: T, index: number) => string;
}

function PagerView<T>({
  data,
  renderPage,
  onPageChanged,
  initialPageIndex,
  style,
  keyExtractor,
}: PagerViewProps<T>) {
  const { width } = useWindowDimensions();
  const flatListRef = useRef<FlatList<T>>(null);

  useEffect(() => {
    // Using InteractionManager is more reliable than setTimeout.
    InteractionManager.runAfterInteractions(() => {
      if (flatListRef.current) {
        flatListRef.current.scrollToIndex({
          index: initialPageIndex,
          animated: false,
        });
      }
    });
  }, [initialPageIndex]);

  const onMomentumScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    onPageChanged(newIndex);
  };

  const getItemLayout = (_: any, index: number) => ({
    length: width,
    offset: width * index,
    index,
  });

  return (
    <FlatList
      ref={flatListRef}
      style={style}
      data={data}
      renderItem={renderPage}
      keyExtractor={keyExtractor}
      horizontal
      pagingEnabled
      initialScrollIndex={initialPageIndex}
      onMomentumScrollEnd={onMomentumScrollEnd}
      getItemLayout={getItemLayout}
      windowSize={3}
      initialNumToRender={3}
      maxToRenderPerBatch={3}
      showsHorizontalScrollIndicator={false}
    />
  );
}

export default React.memo(PagerView) as typeof PagerView;
