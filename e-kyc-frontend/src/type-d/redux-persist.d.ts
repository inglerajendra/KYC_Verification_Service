declare module 'redux-persist/integration/react' {
  import { ReactNode } from 'react'
  import { Persistor } from 'redux-persist'

  interface PersistGateProps {
    loading?: ReactNode | null
    persistor: Persistor
    children?: ReactNode | null
  }

  export class PersistGate extends React.Component<PersistGateProps> {}
}
