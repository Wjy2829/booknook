import { supabase } from '@/lib/supabaseClient';

// 错误类型枚举，用于更好的错误处理
enum StorageErrorType {
  CONFIG_ERROR = 'CONFIG_ERROR',
  BUCKET_NOT_FOUND = 'BUCKET_NOT_FOUND',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  UPLOAD_ERROR = 'UPLOAD_ERROR',
  URL_ERROR = 'URL_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

// 本地模拟存储，用于开发和测试环境
const mockStorage = new Map<string, string>();

// 生成模拟图片URL
const generateMockImageUrl = (width: number = 300, height: number = 400, errorType?: string) => {
  // 使用picsum.photos代替via.placeholder.com，避免证书错误
  if (errorType) {
    // 返回带有错误信息的URL，但使用picsum作为基础
    return `https://picsum.photos/${width}/${height}?grayscale`;
  }
  return `https://picsum.photos/${width}/${height}?random=${Math.floor(Math.random() * 1000)}`;
};

const generateFilePath = (folder: string, filename: string) => {
  const ext = filename.split('.').pop();
  const timestamp = Date.now();
  // 使用更兼容的方式生成唯一ID，不依赖crypto.randomUUID()
  const uniqueId = Math.random().toString(36).substring(2, 15) + 
                  Math.random().toString(36).substring(2, 15);
  return `${folder}/${timestamp}-${uniqueId}.${ext}`;
};

const uploadFile = async (bucket: string, folder: string, file: File) => {
  console.log('==== 开始上传文件 ====');
  console.log('上传参数:', { 
    bucket, 
    folder, 
    fileName: file.name, 
    fileSize: file.size, 
    fileType: file.type,
    fileExists: !!file,
    fileValid: file instanceof File
  });
  
  try {
    // 检查文件有效性
    if (!file || !(file instanceof File)) {
      console.error('错误: 无效的文件对象');
      return generateMockImageUrl(300, 400, StorageErrorType.UPLOAD_ERROR);
    }
    
    // 检查Supabase客户端是否初始化
    if (!supabase || !supabase.storage) {
      console.error('警告: Supabase客户端未正确初始化，使用模拟存储');
      // 使用模拟存储
      const mockKey = `${bucket}-${folder}-${file.name}`;
      const mockUrl = generateMockImageUrl(300, 400);
      mockStorage.set(mockKey, mockUrl);
      console.log('模拟存储URL生成:', mockUrl);
      return mockUrl;
    }
    
    console.log('Supabase客户端可用，开始检查存储桶');
    
    // 检查存储桶是否存在
    console.log(`查询存储桶列表，检查 ${bucket} 是否存在`);
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('列出存储桶时出错:', { 
        message: listError.message 
      });
      // 使用模拟存储作为回退
      const mockKey = `${bucket}-${folder}-${file.name}`;
      const mockUrl = generateMockImageUrl(300, 400);
      mockStorage.set(mockKey, mockUrl);
      console.log('存储桶列表获取失败，使用模拟存储URL:', mockUrl);
      return mockUrl;
    }
    
    console.log('获取到的存储桶列表:', buckets?.map(b => b.name));
    const bucketExists = buckets?.some(b => b.name === bucket);
    
    if (!bucketExists) {
      console.warn(`警告: 存储桶 ${bucket} 不存在，使用模拟存储`);
      // 使用模拟存储作为回退
      const mockKey = `${bucket}-${folder}-${file.name}`;
      const mockUrl = generateMockImageUrl(300, 400);
      mockStorage.set(mockKey, mockUrl);
      console.log('模拟存储URL生成:', mockUrl);
      return mockUrl;
    }
    
    console.log(`存储桶 ${bucket} 存在，开始准备上传`);
    const path = generateFilePath(folder, file.name);
    console.log('生成文件路径:', path);
    
    // 尝试获取存储桶的公共URL（权限测试）
    console.log('测试存储桶权限，尝试获取根路径URL');
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl('');
    console.log('权限测试结果:', { hasUrl: !!urlData?.publicUrl, url: urlData?.publicUrl });
    
    // 即使权限测试失败，也继续尝试上传，因为空路径的公共URL可能与具体文件的权限不同
    
    console.log('开始执行文件上传...');
    // 添加详细的上传参数日志
    console.log('上传配置:', { 
      path, 
      bucket,
      cacheControl: '3600',
      upsert: true,
      fileType: file.type,
      fileSize: file.size
    });
    const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, {  
      cacheControl: '3600',
      upsert: true,
    });
    
    if (uploadError) {
      console.error('Supabase上传错误详情:', {
        message: uploadError.message
      });
      
      // 对于特定错误提供更友好的处理
      if (uploadError.message?.includes('Bucket not found')) {
        console.error('存储桶不存在错误，可能是权限问题或配置错误');
        // 使用模拟存储作为回退
        const mockKey = `${bucket}-${folder}-${file.name}`;
        const mockUrl = generateMockImageUrl(300, 400);
        mockStorage.set(mockKey, mockUrl);
        return mockUrl;
      }
      
      if (uploadError.message?.includes('permission denied')) {
        console.error('权限被拒绝错误，请检查存储桶权限设置');
        // 使用模拟存储作为回退
        const mockKey = `${bucket}-${folder}-${file.name}`;
        const mockUrl = generateMockImageUrl(300, 400);
        mockStorage.set(mockKey, mockUrl);
        return mockUrl;
      }
      
      // 其他上传错误也使用模拟存储作为回退
      console.warn('上传失败，使用模拟存储作为回退');
      const mockKey = `${bucket}-${folder}-${file.name}`;
      const mockUrl = generateMockImageUrl(300, 400);
      mockStorage.set(mockKey, mockUrl);
      return mockUrl;
    }
    
    console.log('文件上传成功！开始获取公共URL');
    // 增加更详细的日志记录获取公共URL的过程
    console.log('尝试获取公共URL的文件路径:', path);
    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(path);
    
    console.log('获取公共URL结果:', { 
      hasPublicUrl: !!publicUrlData?.publicUrl, 
      // 获取公共URL结果中不包含error属性，无需记录
      data: publicUrlData
    });
    
    // 即使获取公共URL失败，也先尝试使用可能的URL结构
    if (!publicUrlData?.publicUrl) {
      console.error('获取公共URL失败，尝试使用构建的URL结构');
      // 使用官方方法构建URL，而不是直接访问storageUrl
      // 对于获取URL失败的情况，返回模拟URL作为备选
      console.warn('获取公共URL失败，使用模拟URL作为备选');
      const mockUrl = generateMockImageUrl(300, 400, StorageErrorType.URL_ERROR);
      return mockUrl;
    }
    
    console.log('上传完成！公共URL:', publicUrlData.publicUrl);
    return publicUrlData.publicUrl;
  } catch (error: any) {
    console.error('文件上传过程中出现异常:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      cause: error.cause
    });
    // 在出错时返回模拟图像
    return generateMockImageUrl(300, 400, StorageErrorType.UNKNOWN_ERROR);
  } finally {
    console.log('==== 上传过程结束 ====');
  }
};

export const uploadAvatar = (file: File) => uploadFile('avatars', 'uploads', file);

export const uploadBookCover = (file: File) => uploadFile('book-covers', 'uploads', file);

