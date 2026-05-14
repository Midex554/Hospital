package com.medicore.hospital_backend.service;
import com.medicore.hospital_backend.model.User;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;
import io.jsonwebtoken.security.Keys;
import java.util.Date;

import java.util.Date;

@Service
public class JwtService {

    private static final String SECRET_KEY = "THIS_IS_A_SECRETE_KEY_FOR_HOSPITAL_SYSTEM_123456789";

    public String generateToken(User user) {

        return Jwts.builder()
                .subject(user.getEmail())
                .claim("role", user.getRole().name())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 24))
                .signWith(
                        Keys.hmacShaKeyFor(SECRET_KEY.getBytes()),
                        Jwts.SIG.HS256
                )
                .compact();
    }

    public String extractEmail(String token) {
        return Jwts.parser()
                .verifyWith(Keys.hmacShaKeyFor(SECRET_KEY.getBytes()))
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }


    public boolean isTokenValid(String token, User user){
        String email = extractEmail(token);
        return email.equals(user.getEmail());
    }
}
