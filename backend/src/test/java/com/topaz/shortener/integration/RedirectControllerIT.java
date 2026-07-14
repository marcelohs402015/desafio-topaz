package com.topaz.shortener.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.topaz.shortener.dto.request.CreateUrlRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.httpBasic;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class RedirectControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void shouldRedirectToOriginalUrl() throws Exception {
        CreateUrlRequest request = new CreateUrlRequest();
        request.setOriginalUrl("https://redirect-target.com");
        request.setAlias("redirect-alias");

        mockMvc.perform(post("/api/urls")
                        .with(httpBasic("admin", "admin"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/redirect-alias"))
                .andExpect(status().isFound())
                .andExpect(header().string("Location", "https://redirect-target.com"));
    }

    @Test
    void shouldReturnNotFoundForUnknownCode() throws Exception {
        mockMvc.perform(get("/unknown-code"))
                .andExpect(status().isNotFound());
    }
}
