import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    flex: 1,
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderRadius: 3,
    borderColor: "#E0E0E0", // A common gray-200
  },
  dateCellText: {
    textAlign: "center",
    fontSize: 13,
  },
  weekRow: {
    flex: 1,
    flexDirection: "row",
  },
  weekNumberContainer: {
    borderColor: "#E0E0E0",
    padding: 2,
    width: 20,
    flexDirection: "column",
  },
  weekNumberText: {
    textAlign: "center",
    fontSize: 13, // Equivalent to theme.typography.sm
    color: "#212121", // A common gray-800
  },
  dateCell: {
    borderColor: "#E0E0E0",
    padding: 2,
    flex: 1,
    flexDirection: "column",
  },
  moreLabelText: {
    fontSize: 11, // Equivalent to theme.typography.moreLabel
    marginTop: 2,
    color: "#424242", // A common moreLabel color
  },
  touchableGradually: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  collapseContainer: {
    position: 'absolute',
    bottom: 2,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  collapseText: {
    fontSize: 12,
    color: '#424242',
  },
});