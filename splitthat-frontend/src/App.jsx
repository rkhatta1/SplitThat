import { BrowserRouter, Route, Routes } from "react-router-dom";
import HomeUpload from "./pages/HomeUpload";
import Loading from "./pages/Loading";
import ItemizedEditor from "./pages/ItemizedEditor";
import SplitwiseCallback from "./pages/SplitwiseCallback";
import { SplitProvider } from "./state/SplitContext";

export default function App() {
  return (
    <BrowserRouter>
      <SplitProvider>
        <Routes>
          <Route path="/" element={<HomeUpload />} />
          <Route path="/loading" element={<Loading />} />
          <Route path="/editor" element={<ItemizedEditor />} />
          <Route path="/splitwise-callback" element={<SplitwiseCallback />} />
        </Routes>
      </SplitProvider>
    </BrowserRouter>
  );
}