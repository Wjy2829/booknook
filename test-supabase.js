// 简单测试脚本，用于验证Supabase连接和存储功能
import { createClient } from '@supabase/supabase-js';

// 从环境变量获取配置
const supabaseUrl = 'https://qebzuaofnligptgseong.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlYnp1YW9mbmxpZ3B0Z3Nlb25nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5MzUxMDMsImV4cCI6MjA3ODUxMTEwM30.-WqRrOyb_Ue5gXglAg89AiBFZgGU5qn0RgpGGA1tV7I';

console.log('创建Supabase客户端...');
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSupabaseConnection() {
  console.log('测试Supabase连接...');
  try {
    // 测试基本连接
    const { data, error } = await supabase.from('profiles').select('*').limit(1);
    
    if (error) {
      console.error('数据库查询错误:', error);
      return false;
    }
    
    console.log('数据库连接成功! 查询结果:', data);
    return true;
  } catch (error) {
    console.error('Supabase连接测试失败:', error);
    return false;
  }
}

async function testStorageBucket() {
  console.log('测试存储桶配置...');
  try {
    // 列出所有存储桶
    const { data, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('列出存储桶错误:', error);
      return false;
    }
    
    console.log('存储桶列表:', data);
    
    // 检查是否存在book-covers桶
    const hasBookCoversBucket = data.some(bucket => bucket.name === 'book-covers');
    if (!hasBookCoversBucket) {
      console.error('错误: book-covers存储桶不存在');
    }
    
    return hasBookCoversBucket;
  } catch (error) {
    console.error('存储测试失败:', error);
    return false;
  }
}

async function runAllTests() {
  console.log('=== 开始Supabase测试 ===');
  
  const connectionOk = await testSupabaseConnection();
  console.log('连接测试结果:', connectionOk ? '✓ 通过' : '✗ 失败');
  
  const storageOk = await testStorageBucket();
  console.log('存储桶测试结果:', storageOk ? '✓ 通过' : '✗ 失败');
  
  console.log('=== 测试完成 ===');
}

runAllTests().catch(console.error);