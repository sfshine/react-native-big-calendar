import { router } from "expo-router";
import { useEffect } from "react";
import {
  Button,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const EXAMPLES = [
  {
    name: "Calendar Manager",
    path: "CalendarManager",
  },
  {
    name: "Calendar",
    path: "CalendarDemo",
  },
  {
    name: "Month view pager",
    path: "MonthViewPagerPage",
  },
  {
    name: "3-days view pager",
    path: "ThreeDaysViewPagerPage",
  },
  {
    name: "Month view infinite pager",
    path: "MonthViewInfinitePagerTest",
  },
  {
    name: "Month View (对比)",
    path: "expandlbe/components/MonthView",
  },
];

export default function App() {
  useEffect(() => {
    setTimeout(() => {
      router.replace("/CalendarManager");
    });
  }, []);
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>React Native Big Calendar</Text>
          <Text style={styles.subtitle}>Examples</Text>
        </View>
        <View style={styles.list}>
          {EXAMPLES.map((e) => (
            <View key={e.path} style={styles.button}>
              <Button
                title={e.name}
                onPress={() => router.push(e.path as any)}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    padding: 24,
    backgroundColor: "#eee",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  subtitle: {
    marginTop: 8,
    fontSize: 16,
  },
  list: {
    padding: 24,
  },
  button: {
    marginVertical: 8,
  },
});
