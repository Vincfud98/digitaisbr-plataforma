import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import authReducer from './slices/authSlice';
import associadosReducer from './slices/associadosSlice';
import planosReducer from './slices/planosSlice';
import catalogoReducer from './slices/catalogoSlice';
import lojasReducer from './slices/lojasSlice';
import vendasReducer from './slices/vendasSlice';
import comissoesReducer from './slices/comissoesSlice';
import financeiroReducer from './slices/financeiroSlice';
import beneficiosReducer from './slices/beneficiosSlice';
import parceirosReducer from './slices/parceirosSlice';
import conteudosReducer from './slices/conteudosSlice';
import comunidadeReducer from './slices/comunidadeSlice';
import notificacoesReducer from './slices/notificacoesSlice';
import servicosReducer from './slices/servicosSlice';
import destaquesReducer from './slices/destaquesSlice';
import suporteReducer from './slices/suporteSlice';
import relatoriosReducer from './slices/relatoriosSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    associados: associadosReducer,
    planos: planosReducer,
    catalogo: catalogoReducer,
    lojas: lojasReducer,
    vendas: vendasReducer,
    comissoes: comissoesReducer,
    financeiro: financeiroReducer,
    beneficios: beneficiosReducer,
    parceiros: parceirosReducer,
    conteudos: conteudosReducer,
    comunidade: comunidadeReducer,
    notificacoes: notificacoesReducer,
    servicos: servicosReducer,
    destaques: destaquesReducer,
    suporte: suporteReducer,
    relatorios: relatoriosReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
