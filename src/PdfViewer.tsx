import classNames from "classnames";
import { Fragment, useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import styles from "./pdf-viewer.styles.module.css";
import samplePdf from "../public/sample.pdf";
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export const PdfViewer = () => {
  // ---------------------------------------------------------------------------
  // variables
  // ---------------------------------------------------------------------------

  const leftSideScrollRef = useRef<HTMLDivElement>(null);
  const rightSideScrollRef = useRef<HTMLDivElement>(null);

  const [pageNumber, setPageNumber] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const date = new Date();
  const dateTime = [
    date.getDate(),
    date.getMonth() + 1,
    date.getFullYear(),
  ].join("/");
  let hours = date.getHours();
  let amORpm = hours >= 12 ? "PM" : "AM";

  // ---------------------------------------------------------------------------
  // effects
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!rightSideScrollRef.current || !leftSideScrollRef.current) return;

    const handleScroll = () => {
      if (!rightSideScrollRef.current || !leftSideScrollRef.current) return;
      const { scrollTop } = rightSideScrollRef.current;

      const itemHeight = document.getElementsByClassName(styles.mainPage)[0]
        .clientHeight;

      const newIndex = Math.floor(scrollTop / itemHeight);

      const totalPages = Math.ceil(
        rightSideScrollRef.current.scrollHeight / itemHeight
      );

      if (
        newIndex !== selectedIndex &&
        newIndex >= 0 &&
        newIndex < totalPages
      ) {
        setSelectedIndex(newIndex);
        setPageNumber(newIndex + 1);
        leftSideScrollRef.current.scrollTop = (newIndex * itemHeight) / 2;
      } else {
        setSelectedIndex(newIndex);
        setPageNumber(newIndex + 1);
        leftSideScrollRef.current.scrollTop = newIndex * itemHeight;
      }
    };

    rightSideScrollRef.current.addEventListener("scroll", handleScroll);
    return () => {
      if (rightSideScrollRef.current) {
        rightSideScrollRef.current.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  // ---------------------------------------------------------------------------
  // functions
  // ---------------------------------------------------------------------------

  function handleItemClick(index: number) {
    setSelectedIndex(index);
    onScrollRightSideToIndex(index);
  }

  function onScrollRightSideToIndex(index: number) {
    if (!rightSideScrollRef.current || !leftSideScrollRef.current) return;

    const itemHeight = document.getElementsByClassName(styles.mainPage)[0]
      .clientHeight;
    const scrollTop = index * itemHeight;
    rightSideScrollRef.current.scrollTop = scrollTop;
  }

  // ---------------------------------------------------------------------------
  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div className={styles.headerTitleWrap}>
          <p
            className={styles.pageCount}
          >{`PDF ${pageNumber} of ${pageCount} `}</p>

          <div className={styles.senderNameWrap}>
            <strong className={styles.senderName}>Akbar Khushnazarov</strong>
            <span className={styles.dateTime}>
              {` ${dateTime} at 31/05/23 ${amORpm}`}
            </span>
          </div>
        </div>

        <div>
          <i className={"fas fa-ellipsis-v"} />
          <i className="fas fa-times" />
        </div>
      </div>

      <div className={styles.container}>
        <nav className={styles.nav} ref={leftSideScrollRef}>
          <Document
            className={styles.navDocument}
            file={samplePdf}
            onLoadSuccess={({ numPages }) => setPageCount(numPages)}
          >
            {Array.from(Array(pageCount).keys()).map((index) => (
              <Fragment key={`page${index + 1}`}>
                <Page
                  className={classNames({
                    [styles.navPage]: true,
                    [styles.focused]: index === selectedIndex,
                  })}
                  onClick={() => handleItemClick(index)}
                  height={240}
                  width={165}
                  pageNumber={index + 1}
                />
                <>{index + 1}</>
              </Fragment>
            ))}
          </Document>
        </nav>
        <div className={styles.documentWrap} ref={rightSideScrollRef}>
          <div
            className={styles.mainDocument}
            style={
              zoom >= 2 && zoom <= 5 ? { width: "-webkit-fill-available" } : {}
            }
          >
            <Document
              file={samplePdf}
              onLoadSuccess={({ numPages }) => setPageCount(numPages)}
            >
              {Array.from(Array(pageCount).keys()).map((index) => (
                <Fragment key={`page${index + 1}`}>
                  <Page
                    className={styles.mainPage}
                    height={545}
                    width={373}
                    pageNumber={index + 1}
                    scale={zoom}
                  />
                </Fragment>
              ))}
            </Document>
          </div>
        </div>
      </div>
      <div className={styles.footer}>
        <i className={"fal fa-cloud-download"} onClick={() => {}} />
        <div>
          <button
            className={styles.button}
            onClick={() => {
              if (zoom > 4) return;
              setZoom((prevZoom) => prevZoom * 1.2);
            }}
          >
            zoom in
          </button>
          <button
            className={styles.button}
            onClick={() => {
              if (zoom < 0.5) return;
              setZoom((prevZoom) => prevZoom / 1.2);
            }}
          >
            zoomOut
          </button>
          <button className={styles.button} onClick={() => setZoom(1)}>
            revert
          </button>
        </div>
      </div>
    </div>
  );
};
