var mongoose=require('mongoose');
var userModel=mongoose.model('User');

exports.setLoggedInUser=function(req,res,next){
	if(req.session && req.session.user){
		userModel.findOne({'email':req.session.user.email},function(err,user){
			if(user){
				req.user=user;
				delete req.user.password;
				req.session.user=user;
				req.session.user.password;
				next();
			}
			else{
				//nothing to do
			}
		});
	}
	else{
		next();
	}
};

exports.checkLogin=function(req,res,next){
	if(!req.session.user){
		res.redirect('/users/login/screen');
	}
	else{
		next();
	}
};