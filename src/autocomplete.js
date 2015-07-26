'use strict';

var KEYS = {
    ENTER: 13,
    DOWN: 40,
    UP: 38,
    TAB: 9,
    BACKSPACE: 8
};

var MAX_RESULTS_NUMBER = 5;

var AutoCompleteAddedItemView = Backbone.View.extend({
    tagName: 'div',
    className: 'added',
    attributes : function () {
        return {
          id : this.id
        };
    },

    template: _.template(
        '<%= email %>'
    ),

    initialize: function (options) {
        _.extend(this, options);
    },

    render: function () {
        this.$el.html(this.template({
            'email': this.model.email(),
        }));
        return this;
    }
});

var AutoCompleteItemView = Backbone.View.extend({
    tagName: 'div',
    className: 'autocomplete-item',
    template: _.template(
        '<div class="autocomplete-item-avatar">VD</div>'+
        '<span class="autocomplete-item-col">'+
            '<%= firstName %> <%= lastName %>'+
        '</span>'+
        '<span class="autocomplete-item-col">'+
            '<%= email %>'+ 
        '</span>'
    ),

    events: {
        'click': 'select'
    },
    
    initialize: function(options) {
        this.options = options;
    },

    render: function () {
        this.$el.html(this.template({
            'firstName': this.highlight(this.model.firstName()),
            'lastName': this.highlight(this.model.lastName()),
            'email': this.highlight(this.model.email())
        }));
        return this;
    },
    
    highlight: function (label) { 
        var autocomplete = this.options.parent;
        if (label && autocomplete.currentText) {
            label = label.replace(
                new RegExp(this.escapeRegExp(autocomplete.currentText), 'gi'),
                function (matched) {
                    return '<b>'+matched+'</b>';
                }
            );
        }
        return label;
    },

	escapeRegExp: function(str) {
		return String(str).replace(/([.*+?^${}()|\[\]\/\\])/g, '\\$1');
	},

    select: function () {
        this.options.parent.hide().select(this.model);
        return false;
    }
});

var AutoCompleteView = Backbone.View.extend({
    tagName: 'div',
    className: 'autocomplete',
    addedUsers: [],
    minKeywordLength: 1,
    currentText: '',

    initialize: function (options) {
        _.extend(this, options);
    },

    render: function() {
        this.input
            .keyup(_.bind(this.keyup, this))
            .keydown(_.bind(this.keydown, this))
            .after(this.$el);
        return this;
    },

    isModelAddedToArray: function(array, id) {
        for (var i = 0; i < array.length; i++) {
            if (array[i].id == id) {
                return true;
            }
        }
        return false;
    },

    removeDeletedUsersFromDom: function(addedUsersIds) {
        var self = this;
        if (this.addedUsers.length < addedUsersIds.length) {
            addedUsersIds.forEach(function(id) {
                if (!self.isModelAddedToArray(self.addedUsers, id)) {
                    self.parentElement.find('#'+id).remove();
                }
            });
        }
    },

    addNewUsersToDom: function(addedUsersIds) {
        var self = this;
        this.addedUsers.forEach(function(model){
            if (addedUsersIds.indexOf(model.id+'') === -1) {
                self.wrapperForInputAndDropdown.before(new AutoCompleteAddedItemView({
                    model: model.model,
                    id: model.id        
                }).render().$el);
            } 
        });
    },

    updateAddedUsers: function() {
        var addedUsersIds = [];
        var addedUsers = this.parentElement.find('.added');

        addedUsers.each(function(){
            addedUsersIds.push(this.id);
        });

        this.removeDeletedUsersFromDom(addedUsersIds);
        this.addNewUsersToDom(addedUsersIds);
    },

    keydown: function (event) {
        switch (event.keyCode) {
            case KEYS.UP:  {
                this.move(-1);
                event.preventDefault();
                break;
            }
            case KEYS.DOWN: {
                this.move(+1);
                event.preventDefault();
                break;
            }
            case KEYS.ENTER: {
                this.onEnter();
                event.preventDefault();
                break;
            }
            case KEYS.TAB: {
                this.completeQuery();
                event.preventDefault();
                break;
            }
            case KEYS.BACKSPACE: {
                if (!this.input.val()) {
                    this.removeLastResult();
                }
                break;
            }
        }
    },

    removeLastResult: function() {
        this.addedUsers.pop();
        this.updateAddedUsers();
    },

    completeQuery: function() {
        this.$el.children()[0].click();
    },

    keyup: function () {
        var keyword = this.input.val();
        if (this.isChanged(keyword)) {
            this.currentText = keyword;
            if (this.isValid(keyword)) {
                this.filter(keyword);
            } else {
                this.hide();
            }
        }
    },

    _isAlreadyAdded: function(model) {
        for (var i = 0; i < this.addedUsers.length; i++) {
            if (this.addedUsers[i].model.email() === model.email()) {
                return true;
            }
        }
        return false;
    },

    isPossibleVariant: function(attr, keyword) {
        return attr.toLowerCase().indexOf(keyword) === 0;
    },

    filter: function (keyword) {
        keyword = keyword.toLowerCase();
        var self = this;
        var results = this.model.filter(function (model) {
            if (self._isAlreadyAdded(model)) {
                return false;
            }
            return self.isPossibleVariant(
                model.firstName() || model.lastName() || model.email(), keyword
            );                
        });
        results = results.length > MAX_RESULTS_NUMBER ? results.slice(0, MAX_RESULTS_NUMBER) : results;
        results.sort(function(a, b){
            var firstFieldToCompare = a.firstName || a.lastName || a.email;
            var secondFieldToCompare = b.firstName || b.lastName || b.email; 
            return firstFieldToCompare > secondFieldToCompare ? 1 : -1;
        });
        this.loadResult(results, keyword);
    },

    isValid: function (keyword) {
        return keyword.length >= this.minKeywordLength;
    },

    isChanged: function (keyword) {
        return this.currentText != keyword;
    },

    move: function (position) {
        var current = this.$el.children('.active');
        var siblings = this.$el.children();
        var index = current.index() + position;
        if (siblings.eq(index).length) {
            current.removeClass('active');
            siblings.eq(index).addClass('active');
        }
        return false;
    },

    onEnter: function () {
        this.$el.children('.active').click();
        return false;
    },

    loadResult: function (model) {
        this.show().reset();
        if (model.length) {
            _.forEach(model, this.addItem, this);
            this.show();
        } else {
            this.hide();
        }
    },

    addItem: function (model) {
        this.$el.append(new AutoCompleteItemView({
            model: model,
            parent: this
        }).render().$el);
    },

    select: function (model) {
        this.selectedModel = model;
        this.onSelect(model);
    },

    reset: function () {
        this.$el.empty();
        return this;
    },

    hide: function () {
        this.$el.hide();
        return this;
    },

    show: function () {
        this.$el.show();
        return this;
    },

    onSelect: function (model) {
        this.addedUsers.push({
            model: model,
            id: Math.floor(Math.random() * 100)
        });
        this.updateAddedUsers();
        this.input.val('');
    }
});

var AutoCompleteViewWrapper = Backbone.View.extend({
    tagName: 'div',
    template: _.template(
        '<div class="input-block" id="inputs">'+
            '<div class="wrap">'+
                '<input type="text"'+
                       'class="editable-input"'+
                       'id="toInput"' +
                       'placeholder="Select user"/>'+
            '</div>'+
        '</div>'
    ),

    events: {
        'click': 'focusOnInput'
    },

    focusOnInput: function() {
        this.$el.find('#toInput').focus();
    },

    initialize: function (options) {
        _.extend(this, options);
    },

    render: function () {
        this.input
            .after(this.$el.html(this.template))
            .remove();
        var wrapperForInputAndDropdown = this.$el.find('.wrap');
        wrapperForInputAndDropdown.append(new AutoCompleteView({
            input: this.$el.find('#toInput'),
            wrapperForInputAndDropdown: wrapperForInputAndDropdown,
            parentElement: this.$el,
            model: this.model
        }).render().$el);
        return this;
    },
});
