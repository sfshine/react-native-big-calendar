import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Link } from 'expo-router'

export default function Index() {
  return (
    <View style={styles.container}>
      <Link href="/CalendarDemo" style={styles.button}>
        <Text style={styles.buttonText}>Open Calendar Demo</Text>
      </Link>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
})
