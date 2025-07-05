const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 检查是否安装了必要的工具
function checkDependencies() {
    // Windows 下查找 ImageMagick 和 WebP 工具
    const imagemagickPaths = [
        'convert', // 如果在 PATH 中
        'C:\\Program Files\\ImageMagick-7.1.1-Q16-HDRI\\convert.exe',
        'C:\\Program Files\\ImageMagick-7.0.11-Q16-HDRI\\convert.exe',
        'C:\\Program Files\\ImageMagick-7.0.10-Q16-HDRI\\convert.exe'
    ];
    
    const webpPaths = [
        'cwebp', // 如果在 PATH 中
        'C:\\Program Files\\webp\\bin\\cwebp.exe',
        'C:\\tools\\webp\\cwebp.exe'
    ];
    
    let convertPath = null;
    let cwebpPath = null;
    
    // 查找 ImageMagick
    for (const imgPath of imagemagickPaths) {
        try {
            if (imgPath === 'convert') {
                execSync('convert -version', { stdio: 'ignore' });
                convertPath = 'convert';
                break;
            } else if (fs.existsSync(imgPath)) {
                convertPath = imgPath;
                break;
            }
        } catch (error) {
            // 继续查找下一个路径
        }
    }
    
    // 查找 WebP
    for (const webpPath of webpPaths) {
        try {
            if (webpPath === 'cwebp') {
                execSync('cwebp -version', { stdio: 'ignore' });
                cwebpPath = 'cwebp';
                break;
            } else if (fs.existsSync(webpPath)) {
                cwebpPath = webpPath;
                break;
            }
        } catch (error) {
            // 继续查找下一个路径
        }
    }
    
    if (convertPath && cwebpPath) {
        console.log('✅ ImageMagick 和 WebP 工具已找到');
        console.log(`   ImageMagick: ${convertPath}`);
        console.log(`   WebP: ${cwebpPath}`);
        return { convertPath, cwebpPath };
    } else {
        console.log('❌ 请先安装 ImageMagick 和 WebP 工具:');
        console.log('  - Windows: 下载并安装 ImageMagick 和 WebP');
        console.log('  - Mac: brew install imagemagick webp');
        console.log('  - Linux: sudo apt-get install imagemagick webp');
        return false;
    }
}

// 递归查找图片文件
function findImageFiles(dir, extensions = ['.png', '.jpg', '.jpeg']) {
    const files = [];
    
    function scan(currentDir) {
        const items = fs.readdirSync(currentDir);
        
        for (const item of items) {
            const fullPath = path.join(currentDir, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                scan(fullPath);
            } else if (extensions.includes(path.extname(item).toLowerCase())) {
                files.push(fullPath);
            }
        }
    }
    
    scan(dir);
    return files;
}

// 压缩PNG图片
function compressPNG(inputPath, outputPath, convertPath) {
    try {
        execSync(`"${convertPath}" "${inputPath}" -strip -quality 85 "${outputPath}"`, { stdio: 'ignore' });
        const originalSize = fs.statSync(inputPath).size;
        const compressedSize = fs.statSync(outputPath).size;
        const savings = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
        console.log(`📦 PNG压缩: ${path.basename(inputPath)} - 节省 ${savings}%`);
        return true;
    } catch (error) {
        console.log(`❌ PNG压缩失败: ${path.basename(inputPath)}`);
        return false;
    }
}

// 压缩JPEG图片
function compressJPEG(inputPath, outputPath, convertPath) {
    try {
        execSync(`"${convertPath}" "${inputPath}" -strip -quality 85 "${outputPath}"`, { stdio: 'ignore' });
        const originalSize = fs.statSync(inputPath).size;
        const compressedSize = fs.statSync(outputPath).size;
        const savings = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
        console.log(`📦 JPEG压缩: ${path.basename(inputPath)} - 节省 ${savings}%`);
        return true;
    } catch (error) {
        console.log(`❌ JPEG压缩失败: ${path.basename(inputPath)}`);
        return false;
    }
}

// 转换为WebP格式
function convertToWebP(inputPath, outputPath, cwebpPath) {
    try {
        execSync(`"${cwebpPath}" -q 85 "${inputPath}" -o "${outputPath}"`, { stdio: 'ignore' });
        const originalSize = fs.statSync(inputPath).size;
        const webpSize = fs.statSync(outputPath).size;
        const savings = ((originalSize - webpSize) / originalSize * 100).toFixed(1);
        console.log(`🌐 WebP转换: ${path.basename(inputPath)} - 节省 ${savings}%`);
        return true;
    } catch (error) {
        console.log(`❌ WebP转换失败: ${path.basename(inputPath)}`);
        return false;
    }
}

// 主函数
function optimizeImages() {
    const tools = checkDependencies();
    if (!tools) {
        return;
    }
    
    const imagesDir = path.join(__dirname, '../src/images');
    const imageFiles = findImageFiles(imagesDir);
    
    console.log(`🔍 找到 ${imageFiles.length} 个图片文件`);
    
    let totalOriginalSize = 0;
    let totalCompressedSize = 0;
    let totalWebPSize = 0;
    
    for (const filePath of imageFiles) {
        const ext = path.extname(filePath).toLowerCase();
        const dir = path.dirname(filePath);
        const basename = path.basename(filePath, ext);
        
        const originalSize = fs.statSync(filePath).size;
        totalOriginalSize += originalSize;
        
        if (ext === '.png') {
            // 压缩PNG
            const compressedPath = path.join(dir, `${basename}-compressed${ext}`);
            if (compressPNG(filePath, compressedPath, tools.convertPath)) {
                totalCompressedSize += fs.statSync(compressedPath).size;
                
                // 转换为WebP
                const webpPath = path.join(dir, `${basename}.webp`);
                if (convertToWebP(compressedPath, webpPath, tools.cwebpPath)) {
                    totalWebPSize += fs.statSync(webpPath).size;
                }
                
                // 删除临时压缩文件
                fs.unlinkSync(compressedPath);
            }
        } else if (ext === '.jpg' || ext === '.jpeg') {
            // 压缩JPEG
            const compressedPath = path.join(dir, `${basename}-compressed${ext}`);
            if (compressJPEG(filePath, compressedPath, tools.convertPath)) {
                totalCompressedSize += fs.statSync(compressedPath).size;
                
                // 转换为WebP
                const webpPath = path.join(dir, `${basename}.webp`);
                if (convertToWebP(compressedPath, webpPath, tools.cwebpPath)) {
                    totalWebPSize += fs.statSync(webpPath).size;
                }
                
                // 删除临时压缩文件
                fs.unlinkSync(compressedPath);
            }
        }
    }
    
    console.log('\n📊 优化统计:');
    console.log(`原始大小: ${(totalOriginalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`压缩后大小: ${(totalCompressedSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`WebP大小: ${(totalWebPSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`总节省: ${((totalOriginalSize - totalWebPSize) / totalOriginalSize * 100).toFixed(1)}%`);
}

if (require.main === module) {
    optimizeImages();
}

module.exports = { optimizeImages }; 