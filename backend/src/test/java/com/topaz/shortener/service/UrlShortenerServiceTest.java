package com.topaz.shortener.service;

import com.topaz.shortener.config.AppProperties;
import com.topaz.shortener.domain.UrlMapping;
import com.topaz.shortener.dto.request.CreateUrlRequest;
import com.topaz.shortener.dto.request.UpdateUrlRequest;
import com.topaz.shortener.dto.response.UrlResponse;
import com.topaz.shortener.exception.AliasAlreadyExistsException;
import com.topaz.shortener.exception.InvalidAliasException;
import com.topaz.shortener.port.UrlPersistencePort;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UrlShortenerServiceTest {

    @Mock
    private UrlPersistencePort persistencePort;

    private UrlShortenerService urlShortenerService;

    @BeforeEach
    void setUp() {
        AppProperties properties = new AppProperties();
        properties.setBaseUrl("http://localhost:8080");
        urlShortenerService = new UrlShortenerServiceImpl(persistencePort, properties);
    }

    @Test
    void shouldCreateUrlWithAlias() {
        CreateUrlRequest request = new CreateUrlRequest();
        request.setOriginalUrl("https://example.com");
        request.setAlias("meu-link");

        when(persistencePort.existsByShortCode("meu-link")).thenReturn(false);
        when(persistencePort.save(any(UrlMapping.class))).thenAnswer(invocation -> {
            UrlMapping mapping = invocation.getArgument(0);
            mapping.setId(1L);
            return mapping;
        });

        UrlResponse response = urlShortenerService.create(request);

        assertEquals("meu-link", response.getShortCode());
        assertEquals("http://localhost:8080/meu-link", response.getShortUrl());
    }

    @Test
    void shouldCreateUrlWithGeneratedCode() {
        CreateUrlRequest request = new CreateUrlRequest();
        request.setOriginalUrl("https://example.com");

        when(persistencePort.save(any(UrlMapping.class))).thenAnswer(invocation -> {
            UrlMapping mapping = invocation.getArgument(0);
            if (mapping.getId() == null) {
                mapping.setId(10L);
            }
            return mapping;
        });

        UrlResponse response = urlShortenerService.create(request);

        assertEquals("a", response.getShortCode());
        ArgumentCaptor<UrlMapping> captor = ArgumentCaptor.forClass(UrlMapping.class);
        verify(persistencePort, org.mockito.Mockito.atLeast(2)).save(captor.capture());
    }

    @Test
    void shouldThrowWhenAliasIsReserved() {
        CreateUrlRequest request = new CreateUrlRequest();
        request.setOriginalUrl("https://example.com");
        request.setAlias("api");

        assertThrows(InvalidAliasException.class, () -> urlShortenerService.create(request));
    }

    @Test
    void shouldThrowWhenAliasAlreadyExists() {
        CreateUrlRequest request = new CreateUrlRequest();
        request.setOriginalUrl("https://example.com");
        request.setAlias("duplicado");

        when(persistencePort.existsByShortCode("duplicado")).thenReturn(true);

        assertThrows(AliasAlreadyExistsException.class, () -> urlShortenerService.create(request));
    }

    @Test
    void shouldListUrls() {
        UrlMapping first = new UrlMapping();
        first.setId(1L);
        first.setOriginalUrl("https://one.com");
        first.setShortCode("one");
        first.setCreatedAt(LocalDateTime.now());
        first.setAccessCount(2L);

        UrlMapping second = new UrlMapping();
        second.setId(2L);
        second.setOriginalUrl("https://two.com");
        second.setShortCode("two");
        second.setCreatedAt(LocalDateTime.now());
        second.setAccessCount(0L);

        when(persistencePort.findAllOrderByCreatedAtDesc()).thenReturn(Arrays.asList(first, second));

        List<UrlResponse> urls = urlShortenerService.list();
        assertEquals(2, urls.size());
        assertEquals("one", urls.get(0).getShortCode());
    }

    @Test
    void shouldUpdateUrl() {
        UrlMapping mapping = new UrlMapping();
        mapping.setId(3L);
        mapping.setOriginalUrl("https://old.com");
        mapping.setShortCode("old");
        mapping.setCreatedAt(LocalDateTime.now());
        mapping.setAccessCount(1L);

        UpdateUrlRequest request = new UpdateUrlRequest();
        request.setOriginalUrl("https://new.com");
        request.setAlias("new-alias");

        when(persistencePort.findById(3L)).thenReturn(Optional.of(mapping));
        when(persistencePort.existsByShortCodeAndIdNot("new-alias", 3L)).thenReturn(false);
        when(persistencePort.save(any(UrlMapping.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UrlResponse response = urlShortenerService.update(3L, request);

        assertEquals("https://new.com", response.getOriginalUrl());
        assertEquals("new-alias", response.getShortCode());
    }

    @Test
    void shouldDeleteExistingUrl() {
        UrlMapping mapping = new UrlMapping();
        mapping.setId(5L);
        mapping.setOriginalUrl("https://example.com");
        mapping.setShortCode("abc");
        mapping.setCreatedAt(LocalDateTime.now());
        mapping.setAccessCount(0L);

        when(persistencePort.findById(5L)).thenReturn(Optional.of(mapping));

        urlShortenerService.delete(5L);

        verify(persistencePort).deleteById(5L);
    }
}
