// 使用Supabase SDK直接创建存储桶和设置权限的脚本
import { createClient } from '@supabase/supabase-js';

// 从环境变量获取配置
const supabaseUrl = 'https://qebzuaofnligptgseong.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlYnp1YW9mbmxpZ3B0Z3Nlb25nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5MzUxMDMsImV4cCI6MjA3ODUxMTEwM30.-WqRrOyb_Ue5gXglAg89AiBFZgGU5qn0RgpGGA1tV7I';

console.log('=== 开始创建Supabase存储桶 ===');

// 创建Supabase客户端
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 直接使用SQL创建存储桶和权限策略（更可靠的方法）
async function createBucketWithSQL() {
  try {
    console.log('1. 开始创建存储桶和设置权限...');
    
    // 创建存储桶
    const createBucketSQL = `
      INSERT INTO storage.buckets (id, name, owner)
      VALUES ('book-covers', 'book-covers', 'authenticated')
      ON CONFLICT (id) DO NOTHING;
    `;
    
    const { error: bucketError } = await supabase.rpc('execute_sql', {
      sql: createBucketSQL
    });
    
    if (bucketError) {
      console.error('❌ 创建存储桶失败:', bucketError.message);
      console.log('尝试通过控制台创建存储桶...');
      return false;
    }
    
    console.log('✅ 存储桶创建成功');
    
    // 设置公开访问权限
    const selectPolicySQL = `
      CREATE POLICY "Public Access" ON storage.objects
      FOR SELECT USING (bucket_id = 'book-covers')
      ON CONFLICT (name, bucket_id) DO NOTHING;
    `;
    
    const { error: selectError } = await supabase.rpc('execute_sql', {
      sql: selectPolicySQL
    });
    
    if (selectError) {
      console.error('⚠️ 设置读取权限失败:', selectError.message);
    } else {
      console.log('✅ 读取权限设置成功');
    }
    
    // 设置上传权限
    const insertPolicySQL = `
      CREATE POLICY "Allow uploads" ON storage.objects
      FOR INSERT TO authenticated
      WITH CHECK (bucket_id = 'book-covers')
      ON CONFLICT (name, bucket_id) DO NOTHING;
    `;
    
    const { error: insertError } = await supabase.rpc('execute_sql', {
      sql: insertPolicySQL
    });
    
    if (insertError) {
      console.error('⚠️ 设置上传权限失败:', insertError.message);
    } else {
      console.log('✅ 上传权限设置成功');
    }
    
    // 设置更新和删除权限
    const updatePolicySQL = `
      CREATE POLICY "Allow updates" ON storage.objects
      FOR UPDATE TO authenticated
      USING (bucket_id = 'book-covers')
      ON CONFLICT (name, bucket_id) DO NOTHING;
    `;
    
    const { error: updateError } = await supabase.rpc('execute_sql', {
      sql: updatePolicySQL
    });
    
    if (updateError) {
      console.error('⚠️ 设置更新权限失败:', updateError.message);
    } else {
      console.log('✅ 更新权限设置成功');
    }
    
    const deletePolicySQL = `
      CREATE POLICY "Allow deletes" ON storage.objects
      FOR DELETE TO authenticated
      USING (bucket_id = 'book-covers')
      ON CONFLICT (name, bucket_id) DO NOTHING;
    `;
    
    const { error: deleteError } = await supabase.rpc('execute_sql', {
      sql: deletePolicySQL
    });
    
    if (deleteError) {
      console.error('⚠️ 设置删除权限失败:', deleteError.message);
    } else {
      console.log('✅ 删除权限设置成功');
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ 执行SQL时发生错误:', error.message);
    return false;
  }
}

// 验证存储桶是否创建成功
async function verifyBucket() {
  try {
    console.log('\n2. 验证存储桶是否创建成功...');
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('❌ 验证失败:', error.message);
      return false;
    }
    
    console.log('当前存储桶列表:', buckets?.map(b => b.name));
    
    const bucketExists = buckets?.some(b => b.name === 'book-covers');
    if (bucketExists) {
      console.log('✅ book-covers存储桶验证成功！');
      return true;
    } else {
      console.error('❌ book-covers存储桶仍然不存在');
      return false;
    }
  } catch (error) {
    console.error('❌ 验证过程中发生错误:', error.message);
    return false;
  }
}

// 提供手动创建指南
function showManualInstructions() {
  console.log('\n📋 手动创建存储桶指南:');
  console.log('1. 登录 Supabase 控制台 (https://app.supabase.com)');
  console.log('2. 选择您的项目');
  console.log('3. 点击左侧菜单中的 "存储"');
  console.log('4. 点击 "新建存储桶" 按钮');
  console.log('5. 输入存储桶名称: book-covers');
  console.log('6. 确保选择 "公开" 或配置适当的权限');
  console.log('7. 点击创建');
  console.log('\n然后在SQL编辑器中运行以下权限策略:');
  console.log(`
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
USING (bucket_id = 'book-covers');
  `);
}

// 主函数
async function main() {
  console.log('开始执行存储桶创建...');
  
  // 尝试使用SQL创建存储桶
  const sqlSuccess = await createBucketWithSQL();
  
  // 验证存储桶是否创建成功
  const verified = await verifyBucket();
  
  if (verified) {
    console.log('\n🎉 存储桶创建和验证成功！您现在可以上传图片了。');
  } else {
    console.log('\n⚠️ 自动创建失败，请按照以下步骤手动创建存储桶:');
    showManualInstructions();
  }
  
  console.log('\n=== 操作完成 ===');
}

// 运行主函数
main().catch(console.error);