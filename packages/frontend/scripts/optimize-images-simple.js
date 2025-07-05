const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 图片优化配置
const config = {
    imagemagickPath: 'C:\\Program Files\\ImageMagick-7.1.1-Q16-HDRI\\magick.exe',
    quality: 85,
    stripMetadata: true
};

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

// 压缩图片
function compressImage(inputPath, outputPath) {
    try {
        const options = [];
        if (config.stripMetadata) {
            options.push('-strip');
        }
        options.push('-quality', config.quality);
        
        const command = `"${config.imagemagickPath}" "${inputPath}" ${options.join(' ')} "${outputPath}"`;
        execSync(command, { stdio: 'ignore' });
        
        const originalSize = fs.statSync(inputPath).size;
        const compressedSize = fs.statSync(outputPath).size;
        const savings = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
        
        console.log(`📦 图片压缩: ${path.basename(inputPath)} - 节省 ${savings}%`);
        return { originalSize, compressedSize };
    } catch (error) {
        console.log(`❌ 图片压缩失败: ${path.basename(inputPath)}`);
        return null;
    }
}

// 创建WebP版本
function createWebP(inputPath, outputPath) {
    try {
        const command = `"${config.imagemagickPath}" "${inputPath}" -quality ${config.quality} "${outputPath}"`;
        execSync(command, { stdio: 'ignore' });
        
        const originalSize = fs.statSync(inputPath).size;
        const webpSize = fs.statSync(outputPath).size;
        const savings = ((originalSize - webpSize) / originalSize * 100).toFixed(1);
        
        console.log(`🌐 WebP转换: ${path.basename(inputPath)} - 节省 ${savings}%`);
        return { originalSize, webpSize };
    } catch (error) {
        console.log(`❌ WebP转换失败: ${path.basename(inputPath)}`);
        return null;
    }
}

// 主函数
function optimizeImages() {
    console.log('🖼️ 开始优化图片文件...\n');
    
    // 检查ImageMagick是否可用
    try {
        execSync(`"${config.imagemagickPath}" -version`, { stdio: 'ignore' });
        console.log('✅ ImageMagick 可用');
    } catch (error) {
        console.log('❌ ImageMagick 不可用，请检查安装路径');
        return;
    }
    
    const imagesDir = path.join(__dirname, '../src/images');
    const imageFiles = findImageFiles(imagesDir);
    
    console.log(`🔍 找到 ${imageFiles.length} 个图片文件\n`);
    
    let totalOriginalSize = 0;
    let totalCompressedSize = 0;
    let totalWebPSize = 0;
    let processedCount = 0;
    
    for (const filePath of imageFiles) {
        const ext = path.extname(filePath).toLowerCase();
        const dir = path.dirname(filePath);
        const basename = path.basename(filePath, ext);
        
        const originalSize = fs.statSync(filePath).size;
        totalOriginalSize += originalSize;
        
        if (ext === '.png' || ext === '.jpg' || ext === '.jpeg') {
            // 压缩原图
            const compressedPath = path.join(dir, `${basename}-compressed${ext}`);
            const compressResult = compressImage(filePath, compressedPath);
            
            if (compressResult) {
                totalCompressedSize += compressResult.compressedSize;
                
                // 创建WebP版本
                const webpPath = path.join(dir, `${basename}.webp`);
                const webpResult = createWebP(compressedPath, webpPath);
                
                if (webpResult) {
                    totalWebPSize += webpResult.webpSize;
                }
                
                // 删除临时压缩文件
                fs.unlinkSync(compressedPath);
                processedCount++;
            }
        }
    }
    
    console.log('\n📊 优化统计:');
    console.log(`处理文件数: ${processedCount}/${imageFiles.length}`);
    console.log(`原始大小: ${(totalOriginalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`压缩后大小: ${(totalCompressedSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`WebP大小: ${(totalWebPSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`总节省: ${((totalOriginalSize - totalWebPSize) / totalOriginalSize * 100).toFixed(1)}%`);
    
    // 生成图片优化报告
    const report = {
        timestamp: new Date().toISOString(),
        processedFiles: processedCount,
        totalFiles: imageFiles.length,
        originalSize: totalOriginalSize,
        compressedSize: totalCompressedSize,
        webpSize: totalWebPSize,
        savings: ((totalOriginalSize - totalWebPSize) / totalOriginalSize * 100).toFixed(1)
    };
    
    const reportPath = path.join(__dirname, '../image-optimization-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📝 优化报告已保存到: ${reportPath}`);
}

if (require.main === module) {
    optimizeImages();
}

module.exports = { optimizeImages }; 