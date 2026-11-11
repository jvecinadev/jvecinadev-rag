<?php

namespace App\Services;

class Chunker
{
    /**
     * Target ~800 tokens (~3200 chars) with ~75 token (~300 chars) overlap
     * so a full project case study stays together in one self-contained chunk.
     */
    public function chunk(string $body, string $title, string $typeLabel = 'Project'): array
    {
        $targetChars = 3200;
        $overlapChars = 300;
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

            if ($currentLength > 0 && ($currentLength + 2 + $pLen) > $targetChars) {
                $chunks[] = $prefix . implode("\n\n", $currentParagraphs);

                $overlapParagraphs = [];
                $overlapLen = 0;
                for ($i = count($currentParagraphs) - 1; $i >= 0; $i--) {
                    $candidate = $currentParagraphs[$i];
                    $candidateLen = mb_strlen($candidate);
                    if ($overlapLen === 0 && $candidateLen > $overlapChars) {
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