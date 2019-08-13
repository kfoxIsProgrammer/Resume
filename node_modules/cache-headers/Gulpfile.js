'use strict';

const gulp = require('gulp');
const babel = require('gulp-babel');
const del = require('del');

gulp.task('clean', () => {
    return del(['dist']);
});

gulp.task('compile', ['clean'], () => {
    return gulp.src('src/**/*.js')
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(gulp.dest('dist'));
});

gulp.task('watch', () => {
    gulp.watch('src/**/*.js', ['compile']);
});

gulp.task('default', ['watch', 'compile']);
