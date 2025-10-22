import { Header } from './components/Header';
import { Editor } from './components/Editor';
import { Output } from './components/Output';
import { Preview } from './components/Preview';
import { AppProvider } from './context/AppContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';

function AppContent() {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 container mx-auto p-2 sm:p-4 overflow-hidden">
        {/* Mobile: Tabs Layout */}
        <div className="lg:hidden h-full">
          <Tabs defaultValue="input" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-3 mb-2">
              <TabsTrigger value="input">Input</TabsTrigger>
              <TabsTrigger value="output">Output</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
            <TabsContent value="input" className="flex-1 mt-0 data-[state=active]:flex">
              <Editor />
            </TabsContent>
            <TabsContent value="output" className="flex-1 mt-0 data-[state=active]:flex">
              <Output />
            </TabsContent>
            <TabsContent value="preview" className="flex-1 mt-0 data-[state=active]:flex">
              <Preview />
            </TabsContent>
          </Tabs>
        </div>

        {/* Desktop: 3-Column Layout */}
        <div className="hidden lg:grid grid-cols-3 gap-4 h-full">
          <div className="h-full">
            <Editor />
          </div>
          <div className="h-full">
            <Output />
          </div>
          <div className="h-full">
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
