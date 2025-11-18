// 测试Supabase存储上传功能的脚本
import { createClient } from '@supabase/supabase-js';
import { Readable } from 'stream';

// 从环境变量获取配置
const supabaseUrl = 'https://qebzuaofnligptgseong.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlYnp1YW9mbmxpZ3B0Z3Nlb25nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5MzUxMDMsImV4cCI6MjA3ODUxMTEwM30.-WqRrOyb_Ue5gXglAg89AiBFZgGU5qn0RgpGGA1tV7I';

console.log('=== 开始测试Supabase存储上传功能 ===');

// 创建Supabase客户端
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 模拟文件对象（Node.js环境）
class MockFile {
  constructor(name, size, type) {
    this.name = name;
    this.size = size;
    this.type = type;
  }
}

// 生成文件路径的函数
function generateFilePath(folder, filename) {
  const ext = filename.split('.').pop();
  const timestamp = Date.now();
  return `${folder}/${timestamp}-test.${ext}`;
}

// 测试上传函数
async function testUpload() {
  try {
    console.log('1. 测试存储桶列表获取');
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ 列出存储桶失败:', {
        message: listError.message,
        code: listError.code,
        details: listError.details
      });
      return;
    }
    
    console.log('✅ 成功获取存储桶列表:', buckets?.map(b => b.name));
    
    // 检查book-covers和avatars存储桶是否存在
    const bookCoversExists = buckets?.some(b => b.name === 'book-covers');
    const avatarsExists = buckets?.some(b => b.name === 'avatars');
    
    if (!bookCoversExists || !avatarsExists) {
      console.error('❌ 错误: 缺少必要的存储桶');
      console.log('请先创建缺少的存储桶，使用以下SQL语句或通过Supabase控制台:');
      console.log(`
${!bookCoversExists ? `
-- 创建book-covers存储桶的SQL语句
INSERT INTO storage.buckets (id, name, owner) 
VALUES ('book-covers', 'book-covers', 'authenticated');

-- 添加公开访问权限
CREATE POLICY "Public Access" ON storage.objects 
FOR SELECT USING (bucket_id = 'book-covers');

-- 添加上传权限
CREATE POLICY "Allow uploads" ON storage.objects 
FOR INSERT TO authenticated 
WITH CHECK (bucket_id = 'book-covers');

-- 添加更新权限
CREATE POLICY "Allow updates" ON storage.objects 
FOR UPDATE TO authenticated 
USING (bucket_id = 'book-covers');

-- 添加删除权限
CREATE POLICY "Allow deletes" ON storage.objects 
FOR DELETE TO authenticated 
USING (bucket_id = 'book-covers');` : ''}

${!avatarsExists ? `
-- 创建avatars存储桶的SQL语句
INSERT INTO storage.buckets (id, name, owner) 
VALUES ('avatars', 'avatars', 'authenticated');

-- 添加公开访问权限
CREATE POLICY "Public Access to avatars" ON storage.objects 
FOR SELECT USING (bucket_id = 'avatars');

-- 添加上传权限
CREATE POLICY "Allow uploads to avatars" ON storage.objects 
FOR INSERT TO authenticated 
WITH CHECK (bucket_id = 'avatars');

-- 添加更新权限
CREATE POLICY "Allow updates to avatars" ON storage.objects 
FOR UPDATE TO authenticated 
USING (bucket_id = 'avatars');

-- 添加删除权限
CREATE POLICY "Allow deletes to avatars" ON storage.objects 
FOR DELETE TO authenticated 
USING (bucket_id = 'avatars');` : ''}
      `);
      return;
    }
    
    console.log('✅ book-covers存储桶存在');
    console.log('✅ avatars存储桶存在');
    
    // 测试权限设置
    console.log('2. 测试存储桶权限');
    const { data: urlData, error: urlError } = supabase.storage.from('book-covers').getPublicUrl('');
    console.log('权限测试结果:', { 
      hasUrl: !!urlData?.publicUrl, 
      error: urlError?.message,
      publicUrl: urlData?.publicUrl 
    });
    
    // 创建一个简单的文本文件作为测试
    console.log('3. 创建测试文件');
    const mockFile = new MockFile('test-cover.jpg', 1024, 'image/jpeg');
    
    // 注意：在实际Node.js环境中，你需要提供真实的文件流
    // 这里我们只是为了测试API调用流程
    console.log('4. 尝试上传文件（模拟）');
    
    try {
      // 由于在Node.js环境中无法直接创建浏览器的File对象，
      // 这个调用会失败，但我们可以看到错误信息
      const path = generateFilePath('uploads', mockFile.name);
      console.log('生成的文件路径:', path);
      
      // 这一步在Node.js环境中会失败，但我们可以看到错误信息
      const { error: uploadError } = await supabase.storage.from('book-covers').upload(path, Buffer.from('test'), {
        cacheControl: '3600',
        upsert: true,
        contentType: mockFile.type
      });
      
      if (uploadError) {
        console.error('❌ 上传错误（预期行为，因为使用Buffer而非File）:', {
          message: uploadError.message,
          code: uploadError.code,
          details: uploadError.details
        });
      } else {
        console.log('✅ 上传成功!');
      }
    } catch (uploadException) {
      console.error('❌ 上传异常:', uploadException.message);
    }
    
    console.log('\n📝 前端上传问题排查建议:');
    console.log('1. 确认book-covers存储桶已创建');
    console.log('2. 确认存储桶权限设置正确，至少需要：');
    console.log('   - SELECT权限（读取）');
    console.log('   - INSERT权限（上传）');
    console.log('3. 确认匿名密钥(anon key)有正确的权限');
    console.log('4. 检查浏览器控制台是否有CORS错误');
    console.log('5. 确认用户已登录（需要authenticated角色权限）');
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
  } finally {
    console.log('=== 测试结束 ===');
  }
}

// 运行测试
testUpload().catch(console.error);