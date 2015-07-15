function searchViewModel() {
  this.searchText = ko.observable("")
    
    // Rate limits updates so that json calls are limited
    .extend({ rateLimit: { timeout: 200, method: "notifyWhenChangesStop" } })
    
    // Notifies the listViewModel that search query has changed.
    .publishOn("searchQuery");
}