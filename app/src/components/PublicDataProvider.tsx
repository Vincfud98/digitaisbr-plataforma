import { useEffect, useState } from 'react';
import { Spin } from 'antd';
import { useAppDispatch, useAppSelector } from '../store';
import { setAll as setCatalogo } from '../store/slices/catalogoSlice';
import { setAll as setLojas } from '../store/slices/lojasSlice';

interface Props {
  children: React.ReactNode;
}

export default function PublicDataProvider({ children }: Props) {
  const dispatch = useAppDispatch();
  const produtos = useAppSelector((s) => s.catalogo.list);
  const [ready, setReady] = useState(produtos.length > 0);

  useEffect(() => {
    if (ready) return;
    Promise.all([
      import('../data/products'),
      import('../data/stores'),
    ]).then(([{ mockProducts }, { mockStores }]) => {
      dispatch(setCatalogo(mockProducts));
      dispatch(setLojas(mockStores));
      setReady(true);
    });
  }, [dispatch, ready]);

  if (!ready) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  return <>{children}</>;
}
