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

    let cancelled = false;

    (async () => {
      try {
        const { getDb } = await import('../lib/firebase');
        const [db, { collection, getDocs }] = await Promise.all([
          getDb(),
          import('firebase/firestore'),
        ]);

        const [prodSnap, storeSnap] = await Promise.all([
          getDocs(collection(db, 'products')),
          getDocs(collection(db, 'stores')),
        ]);

        if (cancelled) return;

        if (prodSnap.size > 0 || storeSnap.size > 0) {
          dispatch(setCatalogo(prodSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as any)));
          dispatch(setLojas(storeSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as any)));
          setReady(true);
          return;
        }
      } catch {
        // Firestore unavailable — fall through to mock data
      }

      if (cancelled) return;

      const [{ mockProducts }, { mockStores }] = await Promise.all([
        import('../data/products'),
        import('../data/stores'),
      ]);
      dispatch(setCatalogo(mockProducts));
      dispatch(setLojas(mockStores));
      setReady(true);
    })();

    return () => { cancelled = true; };
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
