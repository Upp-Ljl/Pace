// Mount + compose the design canvas.
const { useEffect } = React;

function App() {
  return (
    <DesignCanvas>
      <DCSection id="notes" title="Designer's note" subtitle="3 directions that completely overturn the current approach · pick one, mix two, or kill all three">
        <DCArtboard id="intro" label="Brief · system · what's different" width={760} height={1360}>
          <IntroCard />
        </DCArtboard>
      </DCSection>

      <DCSection id="dir-1" title="Direction 1 · LOGBOOK" subtitle="The landing IS a Pace session, printed as a log. Dark, mono, no marketing surface.">
        <DCArtboard id="logbook" label="full landing · 1280 × 3640" width={1280} height={3640}>
          <Logbook />
        </DCArtboard>
      </DCSection>

      <DCSection id="dir-2" title="Direction 2 · EVIDENCE" subtitle="Pace's pitch as a case file. Cream paper, exhibit cards, sworn statements.">
        <DCArtboard id="evidence" label="full landing · 1280 × 3960" width={1280} height={3960}>
          <Evidence />
        </DCArtboard>
      </DCSection>

      <DCSection id="dir-3" title="Direction 3 · MANIFESTO" subtitle="No product screenshot above the fold. 5 锁死 决策 is the hero. Accent off purple.">
        <DCArtboard id="manifesto" label="full landing · 1280 × 4480" width={1280} height={4480}>
          <Manifesto />
        </DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
