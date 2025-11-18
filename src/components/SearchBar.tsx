type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export const SearchBar = ({ value, onChange, placeholder = '搜索书名 / 作者 / 推荐语' }: Props) => (
  <div className="search-bar">
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
    />
    {value && (
      <button type="button" onClick={() => onChange('')}>
        清空
      </button>
    )}
  </div>
);

