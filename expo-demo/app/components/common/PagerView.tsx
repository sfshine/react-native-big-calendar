import React, { useRef, useEffect } from "react";
import {
  FlatList,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ViewStyle,
  StyleProp,
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
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (flatListRef.current) {
      if (isMounted.current) {
        // setTimeout to ensure the list has been rendered
        setTimeout(() => {
          if (isMounted.current) {
            flatListRef.current?.scrollToIndex({
              index: initialPageIndex,
              animated: false,
            });
          }
        }, 100);
      }
    }
  }, [initialPageIndex]);

  const onMomentumScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    if (isMounted.current) {
      const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
      onPageChanged(newIndex);
    }
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
