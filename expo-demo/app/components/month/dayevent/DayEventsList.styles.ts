import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  eventItem: {
    padding: 8,
    marginVertical: 4,
    marginHorizontal: 8,
    backgroundColor: "#fff",
    borderRadius: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: "bold",
  },
  eventTime: {
    fontSize: 12,
    color: "#666",
  },
  flatList: {
    flexGrow: 1,
  },
  noEvents: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noEventsText: {
    fontSize: 16,
    color: "#999",
  },
});