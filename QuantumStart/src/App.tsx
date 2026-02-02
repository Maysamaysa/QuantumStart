import { Routes, Route } from 'react-router-dom';
import { Landing } from './pages/Landing';
import { Learn } from './pages/Learn';
import { Playground } from './pages/Playground';
import { TutorialChallenge } from './pages/TutorialChallenge';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/learn" element={<Learn />} />
      <Route path="/playground" element={<Playground />} />
      <Route path="/tutorial/:id" element={<TutorialChallenge />} />
    </Routes>
  );
}

export default App;
