import { Link } from 'react-router-dom';

export const NotFoundPage = () => (
  <section className="page-container">
    <h1>页面走丢了</h1>
    <p>回到首页继续发现好书吧。</p>
    <Link to="/">返回首页</Link>
  </section>
);

