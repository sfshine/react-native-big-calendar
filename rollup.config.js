import jsx from 'acorn-jsx'
import typescript2 from 'rollup-plugin-typescript2'

export default {
  input: './src/index.ts',
  acornInjectPlugins: [jsx()],
  plugins: [
    typescript2({
      tslib: require('tslib'),
      declaration: true,
      tsconfig: 'tsconfig.prod.json',
      check: false,
    }),
  ],
  external: ['react', 'react-native', 'react-native-gesture-handler', 'react-native-infinite-pager', 'react-native-reanimated', 'react-native-pager-view', 'dayjs', 'dayjs/plugin/duration', 'dayjs/plugin/isBetween', 'dayjs/plugin/isoWeek', 'calendarize'],
  output: [
    {
      file: 'build/index.js',
      format: 'cjs',
      name: 'react-native-big-calendar',
      sourcemap: true,
    },
    {
      file: 'build/index.es.js',
      format: 'es',
      sourcemap: true,
    },
  ],
}
