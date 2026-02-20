<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" 
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform" 
    xmlns:tei="http://www.tei-c.org/ns/1.0"
    exclude-result-prefixes="tei">
    
    <xsl:output method="html" encoding="UTF-8" indent="yes"/>
    <xsl:param name="pageFacs" />

    <!-- Root template -->
    <xsl:template match="/">
        <div class="transcription-page">
            <!-- Find the specific pb milestone -->
            <xsl:variable name="start_pb" select="//tei:pb[@facs = $pageFacs]"/>
            
            <xsl:if test="$start_pb">
                <!-- Apply templates to all following siblings until the next pb -->
                <xsl:apply-templates select="$start_pb/following-sibling::node()[generate-id(preceding-sibling::tei:pb[1]) = generate-id($start_pb)]" mode="page-content"/>
            </xsl:if>
        </div>
    </xsl:template>

    <!-- Content rendering (Mode: page-content) -->
    <!-- This ensures we only match elements at the top level of the split -->
    <xsl:template match="tei:p | tei:lg | tei:l" mode="page-content">
        <xsl:apply-templates select="."/>
    </xsl:template>

    <!-- Basic element templates (No mode, used for recursive processing) -->
    <xsl:template match="tei:p">
        <p class="transcription-p">
            <xsl:if test="@facs">
                <xsl:attribute name="data-facs"><xsl:value-of select="@facs"/></xsl:attribute>
            </xsl:if>
            <xsl:apply-templates/>
        </p>
    </xsl:template>

    <xsl:template match="tei:lg">
        <div class="line-group">
            <xsl:if test="@facs">
                <xsl:attribute name="data-facs"><xsl:value-of select="@facs"/></xsl:attribute>
            </xsl:if>
            <xsl:apply-templates/>
        </div>
    </xsl:template>

    <xsl:template match="tei:l">
        <div class="transcription-line">
            <xsl:if test="@facs">
                <xsl:attribute name="data-facs"><xsl:value-of select="@facs"/></xsl:attribute>
            </xsl:if>
            <xsl:apply-templates/>
        </div>
    </xsl:template>

    <xsl:template match="tei:del">
        <s class="del-text"><xsl:apply-templates/></s>
    </xsl:template>

    <xsl:template match="tei:add">
        <sup class="add-text"><xsl:apply-templates/></sup>
    </xsl:template>

    <xsl:template match="tei:persName | tei:placeName">
        <xsl:variable name="refId">
            <xsl:choose>
                <xsl:when test="starts-with(@ref, '#')"><xsl:value-of select="substring(@ref, 2)"/></xsl:when>
                <xsl:otherwise><xsl:value-of select="@ref"/></xsl:otherwise>
            </xsl:choose>
        </xsl:variable>
        <xsl:variable name="entity" select="//tei:person[@xml:id = $refId] | //tei:place[@xml:id = $refId]"/>
        <xsl:variable name="link" select="$entity/@sameAs"/>
        <xsl:choose>
            <xsl:when test="$link">
                <a href="https://github.com/boloICOMs/semantic-austen/blob/main/knowledgegraph.ttl" target="_blank" class="entity-link" title="{normalize-space($entity)}">
                    <xsl:apply-templates/>
                </a>
            </xsl:when>
            <xsl:otherwise><span class="entity"><xsl:apply-templates/></span></xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <xsl:template match="tei:term">
        <span class="transcription-term" data-category="{substring-after(@ref, '#')}">
            <xsl:apply-templates/>
        </span>
    </xsl:template>

</xsl:stylesheet>
