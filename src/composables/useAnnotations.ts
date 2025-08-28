import { ref, type Ref } from 'vue';
import * as d3 from 'd3';
import {
  annotation,
  annotationLabel,
  annotationCallout,
  annotationCalloutCurve,
  annotationCalloutCircle,
} from 'd3-svg-annotation';

export interface AnnotationConfig {
  id: string;
  note: {
    label: string;
    title: string;
  };
  x: number;
  y: number;
  dx: number;
  dy: number;
  type: any;
  connector?: {
    points: number[][];
  };
  subject?: {
    radius: number;
    radiusPadding: number;
  };
  color?: string;
}

export interface ProcessedData {
  date: Date;
  value: number;
}

export interface ChartScales {
  x: d3.ScaleTime<number, number>;
  y: d3.ScaleLinear<number, number>;
}

const debugLog = (message: string): void => {
  console.log(`[Annotations Debug]: ${message}`);
};

export function useAnnotations() {
  const annotationList = ref<AnnotationConfig[]>([]);
  const annotationElements = ref<Map<string, Element>>(new Map());

  const createAnnotations = (
    data: ProcessedData[],
    scales: ChartScales
  ): AnnotationConfig[] => {
    const findDataPoint = (dateString: string): ProcessedData | undefined => {
      const targetDate = new Date(dateString);
      return data.find((d) => d.date.getTime() === targetDate.getTime());
    };

    const annotations = [
      {
        id: 'bitcoin-split-2017',
        note: {
          label: 'Bitcoin splits into Bitcoins and Bitcoin Cash',
          title: '08-01-2017',
        },
        x: scales.x(findDataPoint('2017-08-01')?.date || new Date()),
        y: scales.y(findDataPoint('2017-08-01')?.value || 0),
        dx: -15,
        dy: -57,
        type: annotationLabel,
      },
      {
        id: 'china-crypto-ban-2017',
        note: {
          label: 'China shuts down all crypto exchanges',
          title: '09-15-2017',
        },
        x: scales.x(findDataPoint('2017-09-15')?.date || new Date()),
        y: scales.y(findDataPoint('2017-09-15')?.value || 0),
        dx: -18,
        dy: -50,
        type: annotationLabel,
      },
      {
        id: 'segwit2x-delayed-2017',
        note: {
          label: 'Segwit2X delayed',
          title: '11-08-2017',
        },
        x: scales.x(findDataPoint('2017-11-08')?.date || new Date()),
        y: scales.y(findDataPoint('2017-11-08')?.value || 0),
        dx: -2,
        dy: 104,
        type: annotationCallout,
      },
      {
        id: 'bitcoin-10k-2017',
        note: {
          label: 'First time over $10k',
          title: '11-28-2017',
        },
        x: scales.x(findDataPoint('2017-11-28')?.date || new Date()),
        y: scales.y(findDataPoint('2017-11-28')?.value || 0),
        dx: -53,
        dy: -47,
        type: annotationCalloutCurve,
        connector: {
          points: [
            [-9, -24],
            [-30, -44.6],
          ],
        },
      },
      {
        id: 'bitcoin-20k-2017',
        note: {
          label: 'First time over $20k',
          title: '12-16-2017',
        },
        x: scales.x(findDataPoint('2017-12-16')?.date || new Date()),
        y: scales.y(findDataPoint('2017-12-16')?.value || 0),
        dx: -102,
        dy: 2,
        type: annotationLabel,
      },
      {
        id: 'segwit2x-hardfork-2017',
        note: {
          label: 'Segwit2X hard fork',
          title: '12-29-2017',
        },
        x: scales.x(findDataPoint('2017-12-29')?.date || new Date()),
        y: scales.y(findDataPoint('2017-12-29')?.value || 0),
        dx: -4,
        dy: 89,
        type: annotationLabel,
      },
      {
        id: 'rapid-drop-rebound-2018',
        note: {
          label: 'What caused this rapid drop + rebound?',
          title: "Jan - Feb '18",
        },
        x: scales.x(findDataPoint('2017-12-29')?.date || new Date()) - 15,
        y: scales.y(findDataPoint('2017-12-29')?.value || 0) + 150,
        dx: -5,
        dy: 115,
        subject: {
          radius: 45,
          radiusPadding: 5,
        },
        type: annotationCalloutCircle,
        color: '#ef4837',
      },
    ];

    annotationList.value = annotations;

    return annotations;
  };

  const renderAnnotations = (
    svg: d3.Selection<SVGGElement, unknown, any, any>,
    annotations: AnnotationConfig[]
  ): void => {
    try {
      debugLog('Rendering annotations with d3-svg-annotation library...');

      const makeAnnotations = annotation()
        .annotations(annotations)
        .accessors({
          x: (d: any) => d.x,
          y: (d: any) => d.y,
        })
        .accessorsInverse({
          x: (d: any) => d.x,
          y: (d: any) => d.y,
        });

      const annotationGroup = svg.append('g').attr('class', 'annotation-group');

      (annotationGroup as any).call(makeAnnotations);

      setTimeout(() => {
        const annotationGroup = d3.select('.annotation-group');
        if (!annotationGroup.empty()) {
          let annotationCount = 0;

          debugLog('Starting to map annotation elements...');
          debugLog(`Looking for ${annotations.length} annotations`);

          // Find all annotation groups and add data attributes
          annotationGroup.selectAll('g').each((d, i, nodes) => {
            const element = d3.select(nodes[i]);

            // Check if this element contains annotation text
            const textElements = element.selectAll('text');
            let hasAnnotationText = false;

            textElements.each((textD, textI) => {
              const textElement = textD as Element;
              const text = d3.select(textElement).text();

              // Check if this text matches any of our annotations
              const matchingAnnotation = annotations.find(
                (ann) => ann.note.title === text || ann.note.label === text
              );

              if (matchingAnnotation && !hasAnnotationText) {
                element
                  .attr('data-annotation-id', matchingAnnotation.id)
                  .attr('data-annotation-title', matchingAnnotation.note.title)
                  .attr('data-annotation-label', matchingAnnotation.note.label)
                  .attr('data-annotation-index', annotationCount.toString());

                // Store the DOM element for this annotation using the ID
                annotationElements.value.set(
                  matchingAnnotation.id,
                  element.node() as Element
                );

                debugLog(
                  `✅ Mapped annotation "${matchingAnnotation.note.title}" (ID: ${matchingAnnotation.id}) to DOM element ${i}`
                );

                annotationCount++;
                hasAnnotationText = true;
              }
            });
          });

          debugLog(`📊 Mapped ${annotationCount} annotations to DOM elements`);
          debugLog(`🗺️ Element map size: ${annotationElements.value.size}`);

          // Log what's in our map
          annotationElements.value.forEach((element, key) => {
            debugLog(`🗺️ Map entry: ${key} -> Element: ${element.tagName}`);
          });
        }
      }, 800); // Increased timeout for better reliability

      makeAnnotationsDraggable(annotationGroup);

      debugLog('Annotations rendered successfully!');
    } catch (error) {
      debugLog(
        `Error rendering annotations: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
      renderCustomAnnotations(svg, annotations);
    }
  };

  // Make annotations draggable
  const makeAnnotationsDraggable = (
    annotationGroup: d3.Selection<SVGGElement, unknown, any, any>
  ): void => {
    setTimeout(() => {
      const draggableElements = annotationGroup.selectAll(
        '.annotation-note, .annotation-subject, .annotation-connector'
      );

      const drag = d3
        .drag<SVGElement, unknown>()
        .on(
          'start',
          function (event: d3.D3DragEvent<SVGElement, unknown, unknown>) {
            d3.select(this).style('opacity', 0.8);
            d3.select(this)
              .attr('data-mouse-start-x', event.x.toString())
              .attr('data-mouse-start-y', event.y.toString());
          }
        )
        .on(
          'drag',
          function (event: d3.D3DragEvent<SVGElement, unknown, unknown>) {
            const element = d3.select(this);
            const mouseStartX = parseFloat(
              element.attr('data-mouse-start-x') || '0'
            );
            const mouseStartY = parseFloat(
              element.attr('data-mouse-start-y') || '0'
            );

            const deltaX = event.x - mouseStartX;
            const deltaY = event.y - mouseStartY;

            let parentGroup = element;
            let currentNode = parentGroup.node();
            while (
              currentNode &&
              currentNode.parentNode &&
              currentNode.parentNode.nodeType === 1
            ) {
              const parentElement = currentNode.parentNode as Element;
              if (parentElement.tagName === 'g') {
                parentGroup = d3.select(parentElement as SVGElement);
                break;
              }
              currentNode = parentElement as SVGElement;
            }

            if (parentGroup.node()) {
              const currentTransform =
                parentGroup.attr('transform') || 'translate(0,0)';
              const match = currentTransform.match(
                /translate\(([^,]+),\s*([^)]+)\)/
              );

              let currentX = 0,
                currentY = 0;
              if (match) {
                currentX = parseFloat(match[1]) || 0;
                currentY = parseFloat(match[2]) || 0;
              }

              const newX = currentX + deltaX;
              const newY = currentY + deltaY;
              parentGroup.attr('transform', `translate(${newX}, ${newY})`);

              element
                .attr('data-mouse-start-x', event.x.toString())
                .attr('data-mouse-start-y', event.y.toString());
            }
          }
        )
        .on('end', function () {
          d3.select(this).style('opacity', 1);
        });

      draggableElements.call(drag as any);
      debugLog('Drag functionality applied to annotations');
    }, 100);
  };

  // Render custom annotations as fallback
  const renderCustomAnnotations = (
    svg: d3.Selection<SVGGElement, unknown, any, any>,
    annotations: AnnotationConfig[]
  ): void => {
    debugLog('Rendering custom annotations as fallback...');

    const annotationGroup = svg.append('g').attr('class', 'custom-annotations');

    annotations.forEach((ann) => {
      const annotation = annotationGroup
        .append('g')
        .attr('class', 'custom-annotation')
        .attr('transform', `translate(${ann.x}, ${ann.y})`);

      // Reference circle
      annotation
        .append('circle')
        .attr('class', 'custom-annotation-circle')
        .attr('r', 4);

      // Connector line
      annotation
        .append('line')
        .attr('class', 'custom-annotation-line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', ann.dx)
        .attr('y2', ann.dy);

      // Text box background
      annotation
        .append('rect')
        .attr('x', ann.dx - 80)
        .attr('y', ann.dy - 60)
        .attr('width', 160)
        .attr('height', 50)
        .attr('fill', 'white')
        .attr('stroke', '#ccc')
        .attr('stroke-width', 1)
        .attr('rx', 5);

      // Date text
      annotation
        .append('text')
        .attr('class', 'custom-annotation-text')
        .attr('x', ann.dx)
        .attr('y', ann.dy - 40)
        .text(ann.note.title);

      // Event text
      annotation
        .append('text')
        .attr('class', 'custom-annotation-event')
        .attr('x', ann.dx)
        .attr('y', ann.dy - 25)
        .text(ann.note.label);

      // Make draggable
      const drag = d3
        .drag<SVGGElement, unknown>()
        .on(
          'drag',
          function (event: d3.D3DragEvent<SVGGElement, unknown, unknown>) {
            const currentTransform = d3.select(this).attr('transform');
            const match = currentTransform.match(
              /translate\(([^,]+),([^)]+)\)/
            );

            if (match) {
              const currentX = parseFloat(match[1]);
              const currentY = parseFloat(match[2]);
              d3.select(this).attr(
                'transform',
                `translate(${currentX + event.dx}, ${currentY + event.dy})`
              );
            }
          }
        );

      annotation.call(drag);
    });

    debugLog('Custom annotations rendered successfully!');
  };

  // Delete annotation
  const deleteAnnotation = (index: number): void => {
    if (index >= 0 && index < annotationList.value.length) {
      const deletedAnnotation = annotationList.value[index];
      debugLog(
        `🗑️ Deleting annotation: ${deletedAnnotation.note.title} (ID: ${deletedAnnotation.id})`
      );

      // Remove from the list
      annotationList.value.splice(index, 1);

      // Simple approach: remove all annotations and recreate them
      debugLog(`🔄 Recreating annotations after deletion...`);

      // Remove the entire annotation group
      const annotationGroup = d3.select('.annotation-group');
      if (!annotationGroup.empty()) {
        annotationGroup.remove();
        debugLog(`✅ Removed old annotation group`);
      }

      // Clear the element map since we're recreating everything
      annotationElements.value.clear();

      // Recreate annotations with the updated list
      const svg = d3.select('#chart svg g') as d3.Selection<
        SVGGElement,
        unknown,
        any,
        any
      >;
      if (!svg.empty()) {
        renderAnnotations(svg, annotationList.value);
        debugLog(
          `✅ Recreated annotations with ${annotationList.value.length} items`
        );
      }

      debugLog(
        `✅ Successfully deleted annotation: ${deletedAnnotation.note.title}`
      );
    }
  };

  // Get annotation type string
  const getAnnotationType = (type: any): string => {
    if (type === annotationLabel) return 'Label';
    if (type === annotationCallout) return 'Callout';
    if (type === annotationCalloutCurve) return 'Curved Callout';
    if (type === annotationCalloutCircle) return 'Circle Callout';
    return 'Unknown';
  };

  // Debug function to inspect current state
  const debugAnnotationState = (): void => {
    debugLog('=== ANNOTATION DEBUG STATE ===');
    debugLog(`📋 List count: ${annotationList.value.length}`);
    debugLog(`🗺️ Element map size: ${annotationElements.value.size}`);

    const annotationGroup = d3.select('.annotation-group');
    if (!annotationGroup.empty()) {
      const domCount = annotationGroup.selectAll('g').size();
      debugLog(`🌐 DOM elements count: ${domCount}`);

      // Check data attributes
      annotationGroup.selectAll('g').each((d, i, nodes) => {
        const el = d3.select(nodes[i]);
        const id = el.attr('data-annotation-id');
        const title = el.attr('data-annotation-title');
        const label = el.attr('data-annotation-label');
        debugLog(
          `  Element ${i}: id="${id}", title="${title}", label="${label}"`
        );
      });
    } else {
      debugLog('❌ No annotation group found in DOM');
    }

    debugLog('=== END DEBUG STATE ===');
  };

  return {
    // State
    annotationList,
    annotationElements,

    // Methods
    createAnnotations,
    renderAnnotations,
    makeAnnotationsDraggable,
    renderCustomAnnotations,
    deleteAnnotation,
    getAnnotationType,
    debugAnnotationState,
  };
}
