var mongoose=require('mongoose');
var express=require('express');
var userRouter=express.Router();
var userModel=mongoose.model('User');
var responseGenerator=require('./../../libs/responseGenerator');
var auth=require('./../../middleWares/auth');
module.exports.controllerFunction=function(app){
	userRouter.get('/login/screen',function(req,res){
		res.render('login');
	});//get login screen ends here

	userRouter.get('/signup/screen',function(req,res){
		res.render('signUp');
	});//get signUp screen ends here

	userRouter.get('/dashboard',auth.checkLogin,function(req,res){
		res.render('dashboard',{user:req.session.user});
	});//end get dashboard


	//this api renders forgot password template
	userRouter.get('/forgotPassword',function(req,res){
		console.log("came here")
		res.render('forgotpassword');
	});
	userRouter.get('/logout',function(req,res){
		req.session.destroy(function(err){
			res.redirect('/users/login/screen');
		});
	});//logOut ends

	userRouter.get('/all',function(req,res){
		userModel.find({},function(err,allUsers){
			if(err){
				res.send(err);
			}
			else{
				res.send(allUsers);
			}	
		});
	});//get allUsers end here

	userRouter.get('/:userName/info',function(req,res){
		userModel.findOne({'userName':req.params.userName},function(err,foundUser){
			if(err){
				var myResponse=responseGenerator.generate(true,"some error"+err,500,null);
				res.send(myResponse);
			}
			else if(foundUser==null ||foundUser==undefined ||foundUser.userName==undefined){
				var myResponse=responseGenerator.generate(true,"user not found",404,null);
				res.render('error',{
					message:myResponse.message,
					error:myResponse.data
				});
			}
			else{
				res.render('dashboard',{user:foundUser});
			}
		});
	});

	userRouter.post('/signUp',function(req,res){
		if(req.body.firstName!=undefined && req.body.lastName!=undefined && req.body.email!=undefined && req.body.password!=undefined){
			userModel.findOne({'userName':req.body.firstName+' '+req.body.lastName},function(err,userMod){
				if(userMod){
					var myResponse=responseGenerator.generate(true,"User with this userName already exists",403,null);
					res.render('error',myResponse);
				}
			});
			var newUser=new userModel({
				userName      :req.body.firstName+' '+req.body.lastName,
				firstName     :req.body.firstName,
				lastName      :req.body.lastName,
				email         :req.body.email,
				mobileNumber  :req.body.mobileNumber,
				password      :req.body.password
			});//creation of newUser ends here

			newUser.save(function(err){
				if(err){
					var myResponse=responseGenerator.generate(true,"some error"+err,500,null);
					res.render('error',{
						message:myResponse.message,
						error:myResponse.data
					});
				}
				else{
					req.session.user=newUser;
					delete req.session.user.password;
					res.redirect('/users/dashboard');
				}
			}) ;
		}
		else{
			var myResponse={
				error:true,
				message:"some body parameter is missing",
				status:403,
				data :null
			};
			res.render('error',{
				message:myResponse.message,
				error:myResponse.data
			});
		}
	});

	userRouter.post('/login',function(req,res){
		userModel.findOne({$and:[{'userName':req.body.userName},{'password':req.body.password}]},function(err,foundUser){
			if(err){
				var myResponse=responseGenerator.generate(true,"some error"+err,500,null);
				res.send(myResponse);
			}
			else if(foundUser==null ||foundUser==undefined ||foundUser.userName==undefined){
				var myResponse=responseGenerator.generate(true,"user not found. check your userName and password",404,null);
				res.render('error',{
					message:myResponse.message,
					error:myResponse.data
				});
			}
			else{
				req.session.user=foundUser;
				delete req.session.user.password;
				res.redirect('/users/dashboard');
			}
		});
	});


	userRouter.post('/changePasswordAndLogin',function(req,res){
		//console.log("hello there");
		//console.log(req.body.userName);
		if(req.body.newPassword!=req.body.confirmPassword){
			var myResponse=responseGenerator.generate(true,"newPassword and confirmPassword should match",400,null);
			res.send(myResponse);
		}
		userModel.findOne({'userName':req.body.userName},function(err,userFound){
			if(err){
				var myResponse=responseGenerator.generate(true,"user not found.check your userName",404,null);
				res.render('error',{
					message:myResponse.message,
					error:myResponse.data
				});
			}
			else{
				userFound.password =req.body.newPassword;
				userFound.save(function(){
					req.session.user=userFound;
					delete req.session.user.password;
					res.redirect('/users/dashboard');
				});
			}
		});
	});
	
	/*userRouter.get('/forgotPassword',function(req,res){
		console.log("came here")
		res.redirect('/forgotpassword');
	});*/
	app.use('/users',userRouter);
};

