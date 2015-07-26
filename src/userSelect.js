$(function () {
	var User = Backbone.Model.extend({
		firstName: function () {
			return this.get("firstName");
		},
		lastName: function() {
			return this.get("lastName");
		},
		email: function() {
			return this.get("email");
		}
	});

	var UserCollection = Backbone.Collection.extend({
		model: User
	});

	var users = new UserCollection([
		{
			"firstName": "andrey",
			"lastName": "some",
			"email": "some@gmail.com"
		},
		{
			"firstName": "vitya",
			"lastName": "vitukin",
			"email": "vit@gmail.com"
		},{
			"firstName": "vityana",
			"lastName": "sads",
			"email": "sd@gmail.com"
		},
		{
			"firstName": "andrii",
			"lastName": "another",
			"email": "another@gmail.com"
		},
		{
			"firstName": "blabla",
			"lastName": "sads",
			"email": "bla@ukr.net"
		},
		{
			"firstName": "anot",
			"email": "sd@gmail.com"
		},
		{
			"lastName": "am",
			"email": "issassa@gmail.com",
		},
		{
			"email": "newemail@gmail.com",
		},
		{
			"email": "email@gmail.com"
		},
		{
			"email": "iasa@gmail.com"
		},
		{
			"email": "ka@gmail.com"
		},
		{
			"firstName": "new",
			"email": "cyber@gmail.com"
		},
		{
			"firstName": "anot",
			"email": "sd@gmail.com"
		},
		{
			"firstName": "blabla@ukr.net",
			"email": "blasome@gmail.com"
		},
		{
			"firstName": "blur",
			"lastName": "blabla",
			"email": "ihoho@gmail.com"
		},
		{
			"lastName": "kiku",
			"firstName": "vasa",
			"email": "vasapeto@gmail.com"
		}
	]);

	new AutoCompleteViewWrapper({
		input: $("#autocomplete"),
		model: users
	}).render();
});