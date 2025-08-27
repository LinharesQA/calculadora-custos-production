const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const { User } = require('../models');

// Estratégia Google OAuth
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_REDIRECT_URL || "/api/auth/google/callback"
},
    async (accessToken, refreshToken, profile, done) => {
        try {
            // Verificar se usuário já existe
            let user = await User.findOne({
                where: { google_id: profile.id }
            });

            if (user) {
                // Atualizar dados se necessário
                await user.update({
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    avatar: profile.photos[0].value,
                    last_login: new Date()
                });

                return done(null, user);
            }

            // Criar novo usuário
            user = await User.create({
                google_id: profile.id,
                name: profile.displayName,
                email: profile.emails[0].value,
                avatar: profile.photos[0].value,
                provider: 'google',
                last_login: new Date()
            });

            return done(null, user);

        } catch (error) {
            console.error('Erro na autenticação Google:', error);
            return done(error, null);
        }
    }
));

// Estratégia JWT
passport.use(new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
},
    async (payload, done) => {
        try {
            const user = await User.findByPk(payload.userId, {
                attributes: { exclude: ['created_at', 'updated_at'] }
            });

            if (user) {
                return done(null, user);
            } else {
                return done(null, false);
            }
        } catch (error) {
            return done(error, false);
        }
    }
));

// Serialização (não necessária para API, mas boa prática)
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findByPk(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});
