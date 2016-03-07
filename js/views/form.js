define(['jquery', 'underscore', 'backbone', 'mustache', '/js/models/page.js', 'text!/templates/form.mustache'], function ($, _, Backbone, Mustache, PageModel, formTemplate) {
  var FormView = Backbone.View.extend({
    el: $('.menu'),
    model: {},

    events: {
      "click #savebtn" : "saveAction"
    },

    initialize: function() {
      this.render();
    },

    saveAction: function(){
      //e.preventDefault();
      var ptitle = $('#title').val();
      var pcontent = $('#content').val();
      var pageModel = new PageModel({
        title: ptitle,
        content: pcontent
      });
      pageModel.save();
      console.log(title, content);
    },

    render: function(){
      var compiledTemplate = Mustache.render( formTemplate, this.data );
      this.$el.html( compiledTemplate );
    }
  });
  return FormView;
});
