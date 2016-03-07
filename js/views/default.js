define(['jquery', 'underscore', 'backbone', 'mustache', '/js/models/page.js', '/js/collections/pages.js', 'text!/templates/pages.mustache'], function ($, _, Backbone, Mustache, PageModel, PagesCollection, pagesTemplate) {
  var DefaultView = Backbone.View.extend({
    el: $('.main'),
    collection: {},

    events: {
      "click .delete" : "deleteAction"
    },

    initialize: function() {
      this.collection = new PagesCollection();
      this.collection.on("sync", this.render, this);
      this.collection.fetch();
    },

    deleteAction: function(e){
      var pid = $(e.target).data('item');
      var pageModel = new PageModel({
        id: pid
      });
      pageModel.destroy();
      location.reload();
    },

    render: function(pageType){
      this.data = this.collection.toJSON();
      var compiledTemplate = Mustache.render( pagesTemplate, this );
      this.$el.html( compiledTemplate );
    }
  });
  return DefaultView;
});
