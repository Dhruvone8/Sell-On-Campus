"use client";

import * as React from "react";
import { Share2, Check, Copy } from "lucide-react";
import { SITE_URL } from "@/lib/constants";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.031 2C6.51 2 2.016 6.49 2.016 12.01c0 1.83.498 3.618 1.442 5.184L2 22l4.981-1.428A9.96 9.96 0 0012.03 22c5.522 0 10.016-4.49 10.016-10.01C22.046 6.49 17.553 2 12.031 2zm5.727 14.167c-.24.672-1.396 1.282-1.93 1.344-.498.058-1.127.085-3.376-.848-2.614-1.084-4.29-3.73-4.42-3.902-.13-.173-1.054-1.402-1.054-2.673 0-1.272.668-1.898.905-2.158.238-.26.519-.325.692-.325.174 0 .347.002.498.01.162.008.38.06.59.563.22.52.748 1.823.813 1.954.065.13.108.282.022.455-.087.173-.13.282-.26.433-.13.152-.27.34-.39.455-.13.13-.26.27-.11.53.15.26.67 1.1 1.44 1.785.99.88 1.82 1.153 2.08 1.282.26.13.41.11.56-.065.152-.173.65-.757.823-1.017.173-.26.347-.216.585-.13.238.086 1.517.714 1.777.844.26.13.433.195.498.303.065.108.065.628-.173 1.3z" />
    </svg>
  );
}

function XTwitterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function RedditIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.197-2.512-.73a.326.326 0 0 0-.232-.095z" />
    </svg>
  );
}

export function SocialShareBanner() {
  const [copied, setCopied] = React.useState(false);

  const shareTitle = "SellOnCampus — Buy, sell, and trade campus gear directly with verified students.";
  const shareUrl = typeof window !== "undefined" && window.location.origin ? window.location.origin : SITE_URL;

  const handleCopy = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = shareUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // ignore
    }
  };

  const openShareWindow = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer,width=600,height=550");
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="bg-white rounded-2xl border border-charcoal-200/80 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xs">
        <div className="flex items-center gap-4 text-center md:text-left">
          <div className="h-12 w-12 rounded-xl bg-brand-50 border border-brand-200/70 text-brand-600 flex items-center justify-center shrink-0">
            <Share2 className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-charcoal-900 font-jakarta">
              Share SellOnCampus With Your Campus
            </h3>
            <p className="text-xs sm:text-sm text-charcoal-500 mt-0.5">
              Help fellow roommates and batchmates find affordable dorm essentials and textbooks.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2.5 shrink-0">
          {/* WhatsApp */}
          <button
            type="button"
            onClick={() =>
              openShareWindow(
                `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareTitle} Check it out: ${shareUrl}`)}`
              )
            }
            title="Share on WhatsApp"
            aria-label="Share on WhatsApp"
            className="h-10 w-10 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366] text-[#25D366] hover:text-white border border-[#25D366]/20 flex items-center justify-center transition-all duration-200 cursor-pointer shadow-2xs hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]"
          >
            <WhatsAppIcon className="w-5 h-5 fill-current" />
          </button>

          {/* X / Twitter */}
          <button
            type="button"
            onClick={() =>
              openShareWindow(
                `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`
              )
            }
            title="Share on X (Twitter)"
            aria-label="Share on X (Twitter)"
            className="h-10 w-10 rounded-xl bg-charcoal-100 hover:bg-charcoal-900 text-charcoal-800 hover:text-white border border-charcoal-200/80 flex items-center justify-center transition-all duration-200 cursor-pointer shadow-2xs hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-charcoal-400"
          >
            <XTwitterIcon className="w-4 h-4 fill-current" />
          </button>

          {/* Reddit */}
          <button
            type="button"
            onClick={() =>
              openShareWindow(
                `https://www.reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareTitle)}`
              )
            }
            title="Share on Reddit"
            aria-label="Share on Reddit"
            className="h-10 w-10 rounded-xl bg-[#FF4500]/10 hover:bg-[#FF4500] text-[#FF4500] hover:text-white border border-[#FF4500]/20 flex items-center justify-center transition-all duration-200 cursor-pointer shadow-2xs hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4500]"
          >
            <RedditIcon className="w-5 h-5 fill-current" />
          </button>

          {/* Copy Link */}
          <button
            type="button"
            onClick={handleCopy}
            title="Copy share link"
            aria-label="Copy share link"
            className="h-10 px-3.5 rounded-xl bg-charcoal-900 hover:bg-charcoal-800 text-white text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 shadow-2xs hover:scale-[1.02] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 stroke-[2.5] text-emerald-400" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 stroke-[2]" />
                <span>Copy Link</span>
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
