import { Header } from './components/Header';
import { Editor } from './components/Editor';
import { Output } from './components/Output';
import { Preview } from './components/Preview';
import { AppProvider } from './context/AppContext';

function AppContent() {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 container mx-auto p-4 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
          {/* Input Panel */}
          <div className="h-full min-h-[400px] lg:min-h-0">
            <Editor />
          </div>

          {/* Output Panel */}
          <div className="h-full min-h-[400px] lg:min-h-0">
            <Output />
          </div>

          {/* Preview Panel */}
          <div className="h-full min-h-[400px] lg:min-h-0">
            <Preview />
          </div>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
