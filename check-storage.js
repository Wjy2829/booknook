// 详细检查Supabase存储桶状态
import { createClient } from '@supabase/supabase-js';

// 从环境变量或直接设置获取配置
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://qebzuaofnligptgseong.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlYnp1YW9mbmxpZ3B0Z3Nlb25nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5MzUxMDMsImV4cCI6MjA3ODUxMTEwM30.-WqRrOyb_Ue5gXglAg89AiBFZgGU5qn0RgpGGA1tV7I';

console.log('=== 详细Supabase存储检查 ===');
console.log(`连接到: ${supabaseUrl}`);
console.log(`使用密钥: ${supabaseAnonKey.substring(0, 10)}...`);

try {
  // 创建Supabase客户端
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  console.log('✅ Supabase客户端创建成功');

  // 测试基本连接
  console.log('\n测试基本连接...');
  const authResponse = await supabase.auth.getSession();
  console.log('认证会话状态:', authResponse);

  // 测试存储桶列表获取，添加详细错误处理
  console.log('\n测试存储桶列表获取...');
  const { data: buckets, error } = await supabase.storage.listBuckets();
  
  if (error) {
    console.error('❌ 获取存储桶列表失败:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint
    });
    
    // 检查是否是权限问题
    if (error.message.includes('permission denied')) {
      console.log('\n⚠️  权限问题提示:');
      console.log('- 请确保使用的anon key有storage权限');
      console.log('- 检查Supabase控制台中的API设置');
    }
  } else {
    console.log(`✅ 成功获取存储桶列表，共 ${buckets?.length || 0} 个存储桶`);
    if (buckets && buckets.length > 0) {
      console.log('存储桶详情:');
      buckets.forEach((bucket, index) => {
        console.log(`${index + 1}. 名称: ${bucket.name}, ID: ${bucket.id}`);
      });
    } else {
      console.log('\n❌ 没有找到任何存储桶');
      console.log('请确保:');
      console.log('1. 已在Supabase控制台创建存储桶');
      console.log('2. 存储桶名称正确（book-covers和avatars）');
      console.log('3. 有正确的权限访问存储桶');
    }
  }

  // 测试存储桶访问（即使不存在也要尝试，获取详细错误）
  console.log('\n测试book-covers存储桶访问...');
  try {
    const { data: urlData } = await supabase.storage.from('book-covers').getPublicUrl('');
    console.log('book-covers存储桶访问结果:', { hasUrl: !!urlData?.publicUrl });
  } catch (bucketError) {
    console.error('book-covers存储桶访问错误:', bucketError.message);
  }

} catch (err) {
  console.error('\n❌ 发生未预期的错误:', err.message);
  console.log('\n详细错误信息:', err);
}