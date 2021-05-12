require([
  'gitbook',
  'jquery',
], (gitbook, $) => {
  // Define global search engine
  function LunrSearchEngine() {
    this.index = null;
    this.store = {};
    this.name = 'LunrSearchEngine';
  }

  // Initialize lunr by fetching the search index
  LunrSearchEngine.prototype.init = function () {
    const that = this;
    const d = $.Deferred();

    $.getJSON(`${gitbook.state.basePath}/search_index.json`)
      .then((data) => {
        // eslint-disable-next-line no-undef
        that.index = lunr.Index.load(data.index);
        that.store = data.store;
        d.resolve();
      });

    return d.promise();
  };

  // Search for a term and return results
  LunrSearchEngine.prototype.search = function (q, offset, length) {
    const that = this;
    let results = [];

    if (this.index) {
      results = $.map(this.index.search(q), (result) => {
        const doc = that.store[result.ref];

        return {
          title: doc.title,
          url: doc.url,
          body: doc.summary || doc.body,
        };
      });
    }

    return $.Deferred().resolve({
      query: q,
      results: results.slice(0, length),
      count: results.length,
    }).promise();
  };

  // Set gitbook research
  gitbook.events.bind('start', (e, config) => {
    const engine = gitbook.search.getEngine();
    if (!engine) {
      gitbook.search.setEngine(LunrSearchEngine, config);
    }
  });
});
