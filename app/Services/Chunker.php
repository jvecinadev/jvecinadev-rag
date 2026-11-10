<?php

namespace App\Services;

class Chunker
{
    /**
     * Target ~400 tokens (~1600 chars) with ~50 token (~200 chars) overlap.
     */
    public function chunk(string $body, string $title, string $typeLabel = 'Project'): array
    {
        $targetChars = 1600;
        $overlapChars = 200;
        $prefix = "{$typeLabel}: {$title}\n\n";

        $rawParagraphs = preg_split('/\R{2,}/', trim($body)) ?: [];
        $paragraphs = array_values(array_filter(array_map('trim', $rawParagraphs), fn ($p) => $p !== ''));

        if (empty($paragraphs)) {
            return [];
        }

        $chunks = [];
        $currentParagraphs = [];
        $currentLength = 0;

        foreach ($paragraphs as $paragraph) {
            $pLen = mb_strlen($paragraph);

            // If adding this paragraph exceeds targetChars and we already have content, flush chunk
            if ($currentLength > 0 && ($currentLength + 2 + $pLen) > $targetChars) {
                $chunks[] = $prefix . implode("\n\n", $currentParagraphs);

                // Keep trailing paragraph(s) up to ~overlapChars for the next chunk
                $overlapParagraphs = [];
                $overlapLen = 0;
                for ($i = count($currentParagraphs) - 1; $i >= 0; $i--) {
                    $candidate = $currentParagraphs[$i];
                    $candidateLen = mb_strlen($candidate);
                    if ($overlapLen === 0 && $candidateLen > $overlapChars) {
                        // Take trailing 200 chars of a long paragraph as overlap
                        $overlapParagraphs[] = '...' . mb_substr($candidate, -$overlapChars);
                        $overlapLen = $overlapChars;
                        break;
                    }
                    if (($overlapLen + $candidateLen) <= $overlapChars) {
                        array_unshift($overlapParagraphs, $candidate);
                        $overlapLen += $candidateLen;
                    } else {
                        break;
                    }
                }

                $currentParagraphs = $overlapParagraphs;
                $currentLength = $overlapLen;
            }

            $currentParagraphs[] = $paragraph;
            $currentLength += ($currentLength > 0 ? 2 : 0) + $pLen;
        }

        if (!empty($currentParagraphs)) {
            $chunks[] = $prefix . implode("\n\n", $currentParagraphs);
        }

        return $chunks;
    }
}