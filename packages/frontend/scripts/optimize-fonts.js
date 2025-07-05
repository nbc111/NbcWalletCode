const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 检查是否安装了fonttools
function checkFontTools() {
    try {
        execSync('pyftsubset --help', { stdio: 'ignore' });
        console.log('✅ fonttools 已安装');
        return true;
    } catch (error) {
        console.log('❌ 请先安装 fonttools:');
        console.log('  pip install fonttools');
        return false;
    }
}

// 获取字体使用的字符
function getFontCharacters() {
    // 这里应该分析项目中实际使用的字符
    // 为了演示，我们使用基本的英文字符和常用符号
    const basicLatin = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const punctuation = " .,!?;:'\"`~@#$%^&*()_+-=[]{}|\\/<>";
    const specialChars = "©®™€£¥¢§¶†‡•–—…‹›«»\"\"''()[]{}⟨⟩⌈⌉⌊⌋";
    
    return basicLatin + punctuation + specialChars;
}

// 子集化字体文件
function subsetFont(inputPath, outputPath, characters) {
    try {
        const tempFile = path.join(path.dirname(outputPath), 'temp_chars.txt');
        fs.writeFileSync(tempFile, characters);
        
        execSync(`pyftsubset "${inputPath}" --text-file="${tempFile}" --output-file="${outputPath}" --flavor=woff2`, { stdio: 'ignore' });
        
        // 清理临时文件
        fs.unlinkSync(tempFile);
        
        const originalSize = fs.statSync(inputPath).size;
        const subsetSize = fs.statSync(outputPath).size;
        const savings = ((originalSize - subsetSize) / originalSize * 100).toFixed(1);
        
        console.log(`🔤 字体子集化: ${path.basename(inputPath)} - 节省 ${savings}%`);
        return { originalSize, subsetSize };
    } catch (error) {
        console.log(`❌ 字体子集化失败: ${path.basename(inputPath)}`);
        return null;
    }
}

// 优化字体文件
function optimizeFonts() {
    if (!checkFontTools()) {
        return;
    }
    
    const fontsDir = path.join(__dirname, '../src/fonts');
    const fontFiles = fs.readdirSync(fontsDir).filter(file => file.endsWith('.woff2'));
    
    console.log(`🔍 找到 ${fontFiles.length} 个字体文件`);
    
    const characters = getFontCharacters();
    let totalOriginalSize = 0;
    let totalSubsetSize = 0;
    
    for (const fontFile of fontFiles) {
        const inputPath = path.join(fontsDir, fontFile);
        const outputPath = path.join(fontsDir, `subset-${fontFile}`);
        
        const result = subsetFont(inputPath, outputPath, characters);
        if (result) {
            totalOriginalSize += result.originalSize;
            totalSubsetSize += result.subsetSize;
            
            // 备份原文件并替换
            const backupPath = path.join(fontsDir, `backup-${fontFile}`);
            fs.renameSync(inputPath, backupPath);
            fs.renameSync(outputPath, inputPath);
        }
    }
    
    console.log('\n📊 字体优化统计:');
    console.log(`原始大小: ${(totalOriginalSize / 1024).toFixed(2)} KB`);
    console.log(`子集化后大小: ${(totalSubsetSize / 1024).toFixed(2)} KB`);
    console.log(`总节省: ${((totalOriginalSize - totalSubsetSize) / totalOriginalSize * 100).toFixed(1)}%`);
}

// 创建字体预加载配置
function createFontPreloadConfig() {
    const fontsDir = path.join(__dirname, '../src/fonts');
    const fontFiles = fs.readdirSync(fontsDir).filter(file => file.endsWith('.woff2'));
    
    const preloadConfig = fontFiles.map(fontFile => {
        const fontName = path.basename(fontFile, '.woff2');
        return {
            name: fontName,
            file: fontFile,
            weight: fontName.includes('Bold') ? 'bold' : 'normal',
            style: fontName.includes('Italic') ? 'italic' : 'normal'
        };
    });
    
    const configPath = path.join(__dirname, '../src/config/fontPreload.js');
    const configContent = `// 自动生成的字体预加载配置
export const fontPreloadConfig = ${JSON.stringify(preloadConfig, null, 2)};

export const getFontPreloadLinks = () => {
    return fontPreloadConfig.map(font => ({
        rel: 'preload',
        href: \`/fonts/\${font.file}\`,
        as: 'font',
        type: 'font/woff2',
        crossOrigin: 'anonymous'
    }));
};
`;
    
    fs.writeFileSync(configPath, configContent);
    console.log('📝 字体预加载配置已生成');
}

// 主函数
function optimizeFontsMain() {
    console.log('🔤 开始优化字体文件...\n');
    
    optimizeFonts();
    console.log('\n' + '='.repeat(50) + '\n');
    createFontPreloadConfig();
}

if (require.main === module) {
    optimizeFontsMain();
}

module.exports = { optimizeFonts, createFontPreloadConfig }; 