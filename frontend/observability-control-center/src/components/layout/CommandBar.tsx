export const CommandBar = () => {
  return (
    <header className="command-bar panel">
      <div className="command-left">
        <input
          aria-label="Search routes or services"
          className="command-search"
          placeholder="Search routes, clients, services..."
          type="search"
        />
        <select aria-label="Environment selector" className="command-select" defaultValue="production">
          <option value="production">Production</option>
          <option value="staging">Staging</option>
          <option value="development">Development</option>
        </select>
      </div>
      <div className="command-right">
        <button className="command-btn" type="button">
          Alerts
        </button>
        <button className="command-btn command-btn-primary" type="button">
          User Menu
        </button>
      </div>
    </header>
  )
}
