type Props = {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  placeholder?: string;
};

export const SearchBar = ({ value, onChange, onSearch, placeholder = '搜索书名 / 作者 / 推荐语' }: Props) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <div className="search-bar">
      <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
        <button 
          type="button" 
          onClick={onSearch} 
          aria-label="搜索"
          style={{ 
            position: 'absolute',
            left: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            backgroundColor: 'transparent',
            border: 'none',
            color: '#999',
            padding: '4px',
            cursor: 'pointer',
            zIndex: 1
          }}
        >
          <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor" style={{ display: 'block', margin: 'auto' }}>
            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
          </svg>
        </button>
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          style={{
            paddingLeft: '36px', // 为左侧的搜索图标留出空间
            paddingRight: '36px', // 为右侧的清空图标留出空间
            width: '100%',
            boxSizing: 'border-box'
          }}
        />
        {value && (
          <button 
            type="button" 
            onClick={() => onChange('')}
            aria-label="清空"
            style={{ 
              position: 'absolute',
              right: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              backgroundColor: 'transparent',
              border: 'none',
              color: '#999',
              padding: '4px',
              cursor: 'pointer',
              zIndex: 1
            }}
          >
            <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor" style={{ display: 'block', margin: 'auto' }}>
              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

