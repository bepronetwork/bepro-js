require([
  'gitbook',
  'jquery',
], (gitbook, $) => {
  // Global search objects
  let engine = null;
  let initialized = false;

  // Set a new search engine
  function setEngine(Engine, config) {
    initialized = false;
    engine = new Engine(config);

    init(config);
  }

  // Initialize search engine with config
  function init(config) {
    if (!engine) throw new Error('No engine set for research. Set an engine using gitbook.research.setEngine(Engine).');

    return engine.init(config)
      .then(() => {
        initialized = true;
        gitbook.events.trigger('search.ready');
      });
  }

  // Launch search for query q
  function query(q, offset, length) {
    if (!initialized) throw new Error('Search has not been initialized');
    return engine.search(q, offset, length);
  }

  // Get stats about search
  function getEngine() {
    return engine ? engine.name : null;
  }

  function isInitialized() {
    return initialized;
  }

  // Initialize gitbook.search
  gitbook.search = {
    setEngine,
    getEngine,
    query,
    isInitialized,
  };
});
