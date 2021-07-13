import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';

export default {
    // tell rollup our main entry point
    entry: './src/index.js',
    dest: `./dist/index.js`,
    moduleName: 'cacheHeaders',
    format: 'cjs',
    plugins: [
        babel({
            exclude: 'node_modules/**'
        }),
        commonjs()
    ]
};
