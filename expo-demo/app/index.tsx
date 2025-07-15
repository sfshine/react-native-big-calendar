import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Link } from "expo-router";

export default function Index() {
  return (
    <View style={styles.container}>
      <Link href="/CalendarDemo" style={styles.button}>
        <Text style={styles.buttonText}>Open Calendar Demo</Text>
      </Link>
      <Link href="/ThreeDaysViewPagerPage" style={styles.button}>
        <Text style={styles.buttonText}>Open 3 Days View Test Page</Text>
      </Link>
      <Link href="/MonthViewInfinitePagerTest" style={styles.button}>
        <Text style={styles.buttonText}>
          Open Month View Test Page (Infinite Pager)
        </Text>
      </Link>
      <Link href="/MonthViewPagerPage" style={styles.button}>
        <Text style={styles.buttonText}>
          Open Month View Test Page (Pager View)
        </Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
});
