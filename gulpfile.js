
const baseDir = "src";
const paths = {
    styles: {
        src: baseDir + '/scss/main.scss',
        dest: "build/css/"
    },
    scripts: {
        src: [
            "node_modules/jquery/dist/jquery.min.js",
            "node_modules/picturefill/dist/picturefill.min.js",
            baseDir + '/js/libs/modernizr-custom.js',
            baseDir + '/js/main.js',
        ],
        dest: 'build/js/'
    },
    images: {
        src: baseDir + '/images/',
        icons: baseDir + '/images/icons/*',
        dest: 'build/images/'
    },
    html: {
        src: baseDir + '/*.html',
        dest: 'build/'
    },
    fonts: {
        src: baseDir + '/fonts/*.{woff2,woff}',
        dest: 'build/fonts/'
    },
    cssOutputName: 'main.min.css',
	jsOutputName:  'main.min.js',
    
}

const { src, dest, parallel, series, watch } = require('gulp');

const scss         = require('gulp-sass');
const csso         = require('gulp-csso');
const postcss      = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const browserSync  = require('browser-sync');
const uglify       = require('gulp-uglify-es').default;
const concat       = require('gulp-concat');
const rename       = require('gulp-rename');
const plumber      = require('gulp-plumber');
const imagemin     = require('gulp-imagemin');
const webp         = require('imagemin-webp');
const svgstore     = require('gulp-svgstore');
const extReplace   = require('gulp-ext-replace');
const posthtml     = require('gulp-posthtml');
const include      = require('posthtml-include');
const del          = require('del');

function browsersync() {
	browserSync.init({
		server: 'build',
		notify: false,
	})
}
function styles() {
    return src(paths.styles.src)
    .pipe(scss())
    .pipe(postcss([ autoprefixer() ]))
    .pipe(csso())
    .pipe(rename(paths.cssOutputName))
    .pipe(dest(paths.styles.dest))
    .pipe(browserSync.stream());
}
function scripts() {
    return src(paths.scripts.src)
    .pipe(concat(paths.jsOutputName))
    .pipe(uglify())
    .pipe(dest(paths.scripts.dest))
    .pipe(browserSync.stream());
}
function images() {
    return src(paths.images.src + '*.*')
    .pipe(
        imagemin([
            imagemin.mozjpeg({quality: 90, progressive: true}),
            imagemin.optipng({optimizationLevel: 3}),
            imagemin.svgo()
        ])
    )
    .pipe(dest(paths.images.dest)),
    src(paths.images.src +'*.*{jpg,png}')
    .pipe(imagemin([
        webp({quality: 85})
    ]))
    .pipe(extReplace('.webp'))
    .pipe(dest(paths.images.dest))
}
function svgSprite() {
    return src(paths.images.icons + ".{svg, svgo, svgs}")
    .pipe(
        imagemin([
            imagemin.svgo()
        ]))
    .pipe(svgstore({
        inlineSvg: true,
    }))
    .pipe(rename("sprite.svg"))
    .pipe(dest(paths.images.dest))
}
function html() {
    return src(paths.html.src)
    .pipe(posthtml([
        include()
    ]))
    .pipe(dest(paths.html.dest))
}
function startwatch() {
    watch(baseDir + '/scss/**/*', styles);
    watch(baseDir + '/js/**/*', scripts);
    watch(baseDir + '/*.html', html);
    watch(paths.images.src + '**/*', images);

}
function cleanBuild() {
    return del("build/");
}
function copyFonts() {
    return src(paths.fonts.src)
    .pipe(dest(paths.fonts.dest))
}
const build          = series(cleanBuild, images, svgSprite, copyFonts, styles, scripts, html);
exports.browsersync  = browsersync;
exports.cleanBuild   = cleanBuild;
exports.copyFonts    = copyFonts;
exports.styles       = styles;
exports.scripts      = scripts;
exports.images       = images;
exports.webp         = webp;
exports.svgSprite    = svgSprite;
exports.html         = html;
exports.build        = build;
exports.startwatch   = startwatch;
exports.default      = series(build, parallel(browsersync, startwatch));

