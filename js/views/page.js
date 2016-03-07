define(['jquery', 'underscore', 'backbone', 'mustache', '/js/models/page.js', 'text!/templates/page.mustache'], function ($, _, Backbone, Mustache, PageModel, pageTemplate) {
  var PageView = Backbone.View.extend({
    el: $('.main'),
    model: {},

    initialize: function(pid) {
      this.model = new PageModel({id: pid});
      this.model.on("sync", this.render, this);
      this.model.fetch();
    },

    render: function(){
      this.data = this.model.toJSON();
      var compiledTemplate = Mustache.render( pageTemplate, this.data );
      this.$el.html( compiledTemplate );
    }
  });
  return PageView;
});
