package com.topaz.shortener.service.impl;

import com.topaz.shortener.config.AppProperties;
import com.topaz.shortener.domain.UrlMapping;
import com.topaz.shortener.dto.request.CreateUrlRequest;
import com.topaz.shortener.dto.request.UpdateUrlRequest;
import com.topaz.shortener.dto.response.UrlResponse;
import com.topaz.shortener.exception.AliasAlreadyExistsException;
import com.topaz.shortener.exception.UrlNotFoundException;
import com.topaz.shortener.port.UrlPersistencePort;
import com.topaz.shortener.service.UrlShortenerService;
import com.topaz.shortener.util.AliasValidator;
import com.topaz.shortener.util.Base62Encoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UrlShortenerServiceImpl implements UrlShortenerService {

    private final UrlPersistencePort persistencePort;
    private final AppProperties appProperties;

    public UrlShortenerServiceImpl(UrlPersistencePort persistencePort, AppProperties appProperties) {
        this.persistencePort = persistencePort;
        this.appProperties = appProperties;
    }

    @Override
    @Transactional
    public synchronized UrlResponse create(CreateUrlRequest request) {
        UrlMapping entity = new UrlMapping();
        entity.setOriginalUrl(request.getOriginalUrl().trim());
        entity.setCreatedAt(LocalDateTime.now());
        entity.setAccessCount(0L);

        if (StringUtils.hasText(request.getAlias())) {
            AliasValidator.assertValidCustomAlias(request.getAlias());
            String normalizedAlias = AliasValidator.normalize(request.getAlias());
            if (persistencePort.existsByShortCode(normalizedAlias)) {
                throw new AliasAlreadyExistsException("Alias '" + normalizedAlias + "' ja esta em uso");
            }
            entity.setShortCode(normalizedAlias);
            UrlMapping saved = persistencePort.save(entity);
            return toResponse(saved);
        }

        entity.setShortCode(buildTemporaryCode());
        UrlMapping saved = persistencePort.save(entity);
        saved.setShortCode(Base62Encoder.encode(saved.getId()));
        UrlMapping updated = persistencePort.save(saved);
        return toResponse(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UrlResponse> list() {
        return persistencePort.findAllOrderByCreatedAtDesc().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public synchronized UrlResponse update(Long id, UpdateUrlRequest request) {
        UrlMapping mapping = persistencePort.findById(id)
                .orElseThrow(() -> new UrlNotFoundException("URL nao encontrada"));

        mapping.setOriginalUrl(request.getOriginalUrl().trim());

        if (StringUtils.hasText(request.getAlias())) {
            AliasValidator.assertValidCustomAlias(request.getAlias());
            String normalizedAlias = AliasValidator.normalize(request.getAlias());
            if (persistencePort.existsByShortCodeAndIdNot(normalizedAlias, id)) {
                throw new AliasAlreadyExistsException("Alias '" + normalizedAlias + "' ja esta em uso");
            }
            mapping.setShortCode(normalizedAlias);
        }

        UrlMapping updated = persistencePort.save(mapping);
        return toResponse(updated);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        UrlMapping mapping = persistencePort.findById(id)
                .orElseThrow(() -> new UrlNotFoundException("URL nao encontrada"));
        persistencePort.deleteById(mapping.getId());
    }

    @Override
    @Transactional
    public String resolveOriginalUrl(String shortCode) {
        if (persistencePort.incrementAccessCount(shortCode) == 0) {
            throw new UrlNotFoundException("URL encurtada nao encontrada");
        }
        return persistencePort.findByShortCode(shortCode)
                .map(UrlMapping::getOriginalUrl)
                .orElseThrow(() -> new UrlNotFoundException("URL encurtada nao encontrada"));
    }

    private UrlResponse toResponse(UrlMapping mapping) {
        UrlResponse response = new UrlResponse();
        response.setId(mapping.getId());
        response.setOriginalUrl(mapping.getOriginalUrl());
        response.setShortCode(mapping.getShortCode());
        response.setShortUrl(buildShortUrl(mapping.getShortCode()));
        response.setAccessCount(mapping.getAccessCount());
        response.setCreatedAt(mapping.getCreatedAt());
        return response;
    }

    private String buildShortUrl(String shortCode) {
        return appProperties.getBaseUrl() + "/" + shortCode;
    }

    private String buildTemporaryCode() {
        return "T" + UUID.randomUUID().toString().replace("-", "").substring(0, 18);
    }
}
