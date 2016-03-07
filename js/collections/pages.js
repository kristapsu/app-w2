define(['underscore', 'backbone', 'models/page'], function (_, Backbone, PageModel) {
  var PagesCollection = Backbone.Collection.extend({
    model: PageModel,
    url: '/pages'
  });
  return PagesCollection;
});
