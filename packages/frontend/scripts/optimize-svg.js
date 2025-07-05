const fs = require('fs');
const path = require('path');

// SVG优化规则
const svgOptimizations = {
    // 移除不必要的属性
    removeAttributes: [
        'xmlns:xlink',
        'xmlns:xml',
        'xml:space',
        'xml:lang',
        'xmlns:dc',
        'xmlns:cc',
        'xmlns:rdf',
        'xmlns:svg',
        'xmlns:sodipodi',
        'xmlns:inkscape',
        'sodipodi:docname',
        'sodipodi:version',
        'inkscape:version',
        'inkscape:export-filename',
        'inkscape:export-xdpi',
        'inkscape:export-ydpi'
    ],
    
    // 移除不必要的元素
    removeElements: [
        'metadata',
        'defs',
        'style',
        'title',
        'desc'
    ],
    
    // 简化路径
    simplifyPaths: true,
    
    // 移除空元素
    removeEmptyElements: true,
    
    // 合并相同样式
    mergeStyles: true
};

// 递归查找SVG文件
function findSVGFiles(dir) {
    const files = [];
    
    function scan(currentDir) {
        const items = fs.readdirSync(currentDir);
        
        for (const item of items) {
            const fullPath = path.join(currentDir, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                scan(fullPath);
            } else if (path.extname(item).toLowerCase() === '.svg') {
                files.push(fullPath);
            }
        }
    }
    
    scan(dir);
    return files;
}

// 优化SVG内容
function optimizeSVGContent(content) {
    let optimized = content;
    
    // 移除不必要的属性
    svgOptimizations.removeAttributes.forEach(attr => {
        const regex = new RegExp(`\\s+${attr}="[^"]*"`, 'g');
        optimized = optimized.replace(regex, '');
    });
    
    // 移除不必要的元素
    svgOptimizations.removeElements.forEach(element => {
        const regex = new RegExp(`<${element}[^>]*>.*?</${element}>`, 'gs');
        optimized = optimized.replace(regex, '');
    });
    
    // 移除空元素
    if (svgOptimizations.removeEmptyElements) {
        optimized = optimized.replace(/<[^>]*>\s*<\/[^>]*>/g, '');
    }
    
    // 移除多余的空格和换行
    optimized = optimized.replace(/\s+/g, ' ').trim();
    
    // 移除注释
    optimized = optimized.replace(/<!--[\s\S]*?-->/g, '');
    
    return optimized;
}

// 优化单个SVG文件
function optimizeSVGFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const originalSize = content.length;
        
        const optimized = optimizeSVGContent(content);
        const optimizedSize = optimized.length;
        
        // 只有当优化效果明显时才保存
        if (optimizedSize < originalSize * 0.95) {
            fs.writeFileSync(filePath, optimized);
            const savings = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);
            console.log(`🎨 SVG优化: ${path.basename(filePath)} - 节省 ${savings}%`);
            return { originalSize, optimizedSize };
        } else {
            console.log(`⚡ SVG已优化: ${path.basename(filePath)}`);
            return { originalSize, optimizedSize: originalSize };
        }
    } catch (error) {
        console.log(`❌ SVG优化失败: ${path.basename(filePath)}`);
        return null;
    }
}

// 优化SVG组件文件
function optimizeSVGComponents() {
    const svgDir = path.join(__dirname, '../src/components/svg');
    const svgFiles = findSVGFiles(svgDir);
    
    console.log(`🔍 找到 ${svgFiles.length} 个SVG文件`);
    
    let totalOriginalSize = 0;
    let totalOptimizedSize = 0;
    
    for (const filePath of svgFiles) {
        const result = optimizeSVGFile(filePath);
        if (result) {
            totalOriginalSize += result.originalSize;
            totalOptimizedSize += result.optimizedSize;
        }
    }
    
    console.log('\n📊 SVG优化统计:');
    console.log(`原始大小: ${(totalOriginalSize / 1024).toFixed(2)} KB`);
    console.log(`优化后大小: ${(totalOptimizedSize / 1024).toFixed(2)} KB`);
    console.log(`总节省: ${((totalOriginalSize - totalOptimizedSize) / totalOriginalSize * 100).toFixed(1)}%`);
}

// 优化图片目录中的SVG文件
function optimizeImageSVGs() {
    const imagesDir = path.join(__dirname, '../src/images');
    const svgFiles = findSVGFiles(imagesDir);
    
    console.log(`🔍 找到 ${svgFiles.length} 个图片SVG文件`);
    
    let totalOriginalSize = 0;
    let totalOptimizedSize = 0;
    
    for (const filePath of svgFiles) {
        const result = optimizeSVGFile(filePath);
        if (result) {
            totalOriginalSize += result.originalSize;
            totalOptimizedSize += result.optimizedSize;
        }
    }
    
    console.log('\n📊 图片SVG优化统计:');
    console.log(`原始大小: ${(totalOriginalSize / 1024).toFixed(2)} KB`);
    console.log(`优化后大小: ${(totalOptimizedSize / 1024).toFixed(2)} KB`);
    console.log(`总节省: ${((totalOriginalSize - totalOptimizedSize) / totalOriginalSize * 100).toFixed(1)}%`);
}

// 主函数
function optimizeSVGs() {
    console.log('🎨 开始优化SVG文件...\n');
    
    optimizeSVGComponents();
    console.log('\n' + '='.repeat(50) + '\n');
    optimizeImageSVGs();
}

if (require.main === module) {
    optimizeSVGs();
}

module.exports = { optimizeSVGs, optimizeSVGFile }; 